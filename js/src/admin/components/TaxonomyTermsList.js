import sortable from 'html5sortable/dist/html5sortable.es.js';

import app from 'flarum/app';
import Component from 'flarum/Component';
import Button from 'flarum/components/Button';
import LoadingIndicator from 'flarum/components/LoadingIndicator';
import sortTerms from '../../common/utils/sortTerms';
import EditTermModal from './EditTermModal';
import taxonomyIcon from '../../common/helpers/taxonomyIcon';

/* global m */

export default class TaxonomyTermsList extends Component {
    init() {
        this.terms = null;

        app.request({
            method: 'GET',
            url: app.forum.attribute('apiUrl') + this.props.taxonomy.apiEndpoint() + '/terms',
        }).then(result => {
            this.terms = app.store.pushPayload(result);
            m.redraw();
        });
    }

    view() {
        return m('.TaxonomyTermEdit', [
            this.terms === null ? LoadingIndicator.component({}) : m('ol.TaxonomyTermList', {
                config: element => {
                    sortable(element)[0].addEventListener('sortupdate', event => {
                        const order = this.$('.js-sort-term-item')
                            .map(function () {
                                return $(this).data('id');
                            })
                            .get();

                        app.request({
                            method: 'POST',
                            url: app.forum.attribute('apiUrl') + this.props.taxonomy.apiEndpoint() + '/terms/order',
                            data: {
                                order,
                            },
                        }).then(result => {
                            // If there's no error, we save the new order so it can be used in case a redraw is triggered
                            app.store.pushPayload(result);
                        }).catch(e => {
                            // If there's an error, we force a full redraw to make sure the user sees what is saved
                            m.redraw.strategy('all');
                            m.redraw();
                            throw e;
                        });
                    });
                },
            }, this.terms.map((term, index) => m('li.TaxonomyTermListItem.js-sort-term-item', {
                'data-id': term.id(),
                style: {
                    color: term.color(),
                },
            }, [
                taxonomyIcon(term),
                m('span.TaxonomyTermListItem-name', term.name()),
                Button.component({
                    className: 'Button Button--link',
                    icon: 'fas fa-pencil-alt',
                    onclick: () => {
                        app.modal.show(new EditTermModal({
                            term,
                            ondelete: () => {
                                this.terms.splice(index, 1);
                            },
                        }));
                    },
                }),
            ]))),
            Button.component({
                className: 'Button',
                onclick: () => {
                    app.modal.show(new EditTermModal({
                        taxonomy: this.props.taxonomy,
                        onsave: term => {
                            this.terms = sortTerms([...this.terms, term]);
                        },
                    }));
                },
            }, app.translator.trans('fof-taxonomies.admin.page.create.term')),
            ' ',
            Button.component({
                className: 'Button',
                onclick: () => {
                    app.request({
                        method: 'POST',
                        url: app.forum.attribute('apiUrl') + this.props.taxonomy.apiEndpoint() + '/terms/order',
                        data: {
                            order: [],
                        },
                    }).then(result => {
                        app.store.pushPayload(result);
                    }).catch(e => {
                        m.redraw.strategy('all');
                        m.redraw();
                        throw e;
                    });
                },
            }, app.translator.trans('fof-taxonomies.admin.page.reset-term-order')),
        ]);
    }
}
