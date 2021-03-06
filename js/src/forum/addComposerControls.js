import app from 'flarum/app';
import {extend, override} from 'flarum/extend';
import DiscussionComposer from 'flarum/components/DiscussionComposer';
import Model from 'flarum/Model';
import icon from 'flarum/helpers/icon';
import ChooseTaxonomyTermsModal from './components/ChooseTaxonomyTermsModal';
import termsLabel from '../common/helpers/termsLabel';
import sortTaxonomies from '../common/utils/sortTaxonomies';
import termToIdentifier from '../common/utils/termToIdentifier';

/* global m */

export default function () {
    extend(DiscussionComposer.prototype, 'headerItems', function (items) {
        sortTaxonomies(app.forum.taxonomies()).forEach(taxonomy => {
            if (taxonomy.type() !== 'discussions') {
                return;
            }

            items.add('taxonomy-' + taxonomy.slug(), m('a.DiscussionComposer-changeTaxonomies', {
                    onclick: () => {
                        app.modal.show(new ChooseTaxonomyTermsModal({
                            taxonomy,
                            selectedTerms: (this[taxonomy.uniqueKey()] || []).slice(0),
                            onsubmit: terms => {
                                this[taxonomy.uniqueKey()] = terms;
                                this.$('textarea').focus();
                            },
                        }));
                    },
                }, this[taxonomy.uniqueKey()] && this[taxonomy.uniqueKey()].length
                ? termsLabel(this[taxonomy.uniqueKey()], {
                    taxonomy,
                })
                : m('span.TaxonomyLabel.untagged', [
                    taxonomy.icon() ? [icon(taxonomy.icon()), ' '] : null,
                    app.translator.trans('fof-taxonomies.forum.composer.choose', {
                        taxonomy: taxonomy.name(),
                    }),
                ])
            ), 9); // Tags uses 10, we add ours right to the tagson the right of the tags
        });
    });

    override(DiscussionComposer.prototype, 'onsubmit', function (original) {
        // Zero timeout to change the execution thread and let the modal close in TagDiscussionModal / ChooseTaxonomyTermsModal
        // before we try opening another one
        const callbacks = [];

        sortTaxonomies(app.forum.taxonomies()).forEach(taxonomy => {
            if (taxonomy.type() !== 'discussions') {
                return;
            }

            const count = (this[taxonomy.uniqueKey()] || []).length;

            if (taxonomy.minTerms() && count < taxonomy.minTerms()) {
                callbacks.push(resolve => {
                    app.modal.show(new ChooseTaxonomyTermsModal({
                        taxonomy,
                        selectedTags: (this[taxonomy.uniqueKey()] || []).slice(0),
                        onsubmit: terms => {
                            this[taxonomy.uniqueKey()] = terms;
                            resolve();
                        },
                    }));
                });
            }
        });

        if (callbacks.length) {
            const callNextCallback = () => {
                if (!callbacks.length) {
                    original();

                    return;
                }

                new Promise(callbacks.shift()).then(() => {
                    // We give time for the modal to close before opening another one
                    // Opening a different modal without closing the first one is very difficult because app.modal.show
                    // Would have to be called in the same thread that just called app.modal.close and it's very difficult
                    // We also apply that delay after our last modal in case Tags' modal shows up after ours
                    setTimeout(() => {
                        callNextCallback();
                    }, 400); // 300ms is bootstrap's default Modal.TRANSITION_DURATION and we add a bit of delay
                });
            }

            if (app.modal.showing) {
                // In case Tags' modal is currently visible (their override ran before ours) we wait for it to close
                // We have no other option because our override is called from TagDiscussionModal.props.onsubmit
                // at which point app.modal.close has not been called yet
                setTimeout(() => {
                    callNextCallback();
                }, 400);
            } else {
                callNextCallback();
            }
        } else {
            original();
        }
    });

    extend(DiscussionComposer.prototype, 'data', function (data) {
        const taxonomyData = [];

        // We put all term IDs from all taxonomies together for the request
        app.forum.taxonomies().forEach(taxonomy => {
            if (taxonomy.type() !== 'discussions') {
                return;
            }

            if (this[taxonomy.uniqueKey()] && this[taxonomy.uniqueKey()].length) {
                taxonomyData.push({
                    verbatim: true, // Flarum workaround, see below in Model.getIdentifier
                    type: 'fof-taxonomies',
                    id: taxonomy.id(),
                    relationships: {
                        terms: {
                            data: this[taxonomy.uniqueKey()].map(termToIdentifier),
                        },
                    },
                });
            }
        });

        data.relationships = data.relationships || {};
        data.relationships.taxonomies = taxonomyData;
    });

    /**
     * The way Flarum parses relationships inside of the save() method prevents us from saving data alongside the relation
     * To work around this, we override this method that will allow us to pass down raw objects directly in the model during save
     */
    override(Model, 'getIdentifier', function (original, model) {
        if (model.verbatim) {
            delete model.verbatim;

            return model;
        }

        return original(model);
    });
}
