import app from 'flarum/app';
import {extend} from 'flarum/extend';
import icon from 'flarum/helpers/icon';

/* global m, flarum */

export default function () {
    // Verify User Directory is enabled and exports all the classes we need
    if (
        !flarum.extensions['fof-user-directory'] ||
        !flarum.extensions['fof-user-directory'].searchTypes ||
        !flarum.extensions['fof-user-directory'].searchTypes.AbstractType ||
        !flarum.extensions['fof-user-directory'].components ||
        !flarum.extensions['fof-user-directory'].components.SearchField
    ) {
        return;
    }

    // Class must be defined here because it needs to extend the base class
    // Which might not be available yet when imports are resolved
    class TaxonomyTermType extends flarum.extensions['fof-user-directory'].searchTypes.AbstractType {
        constructor() {
            super();

            this.allTerms = null;
            this.loadingAllTermsPromise = null;
        }

        resourceType() {
            return 'fof-taxonomy-terms';
        }

        search(query) {
            this.loading = true;

            this.loadTerms().then(() => {
                this.loading = false;
                this.suggestions = [];

                if (!query) {
                    m.redraw();

                    return;
                }

                query = query.toLowerCase();

                this.allTerms.forEach(term => {
                    if (term.name().toLowerCase().indexOf(query) !== -1) {
                        this.suggestions.push(term);
                    }
                });

                m.redraw();
            });
        }

        loadTerms() {
            if (this.loadingAllTermsPromise) {
                return this.loadingAllTermsPromise;
            }

            if (this.allTerms !== null) {
                return Promise.resolve(null);
            }

            this.allTerms = [];

            const promises = [];

            app.store.all('fof-taxonomies').forEach(taxonomy => {
                if (!taxonomy.canSearchUsers() || !taxonomy.showFilter()) {
                    return;
                }

                promises.push(app.request({
                    method: 'GET',
                    url: app.forum.attribute('apiUrl') + taxonomy.apiEndpoint() + '/terms',
                }).then(result => {
                    const terms = app.store.pushPayload(result);

                    terms.forEach(term => {
                        term.pushData({
                            relationships: {
                                taxonomy,
                            },
                        });
                    });

                    this.allTerms.push(...terms);
                }));
            });

            this.loadingAllTermsPromise = Promise.all(promises);

            return this.loadingAllTermsPromise.then(() => {
                this.loadingAllTermsPromise = null;
            });
        }

        renderKind(term) {
            return term.taxonomy().name();
        }

        renderLabel(term) {
            return m('.UserDirectorySearchLabel', term.color() ? {
                className: 'colored',
                style: {
                    backgroundColor: term.color(),
                },
            } : {}, [
                term.icon() ? [
                    icon(term.icon()),
                    ' ',
                ] : null,
                term.name(),
            ]);
        }

        applyFilter(params, resource) {
            params.q = params.q ? params.q + ' ' : '';
            params.q += 'taxonomy:' + resource.taxonomy().slug() + ':' + resource.slug();
        }

        initializeFromParams(params) {
            if (!params.q) {
                return Promise.resolve([]);
            }

            const gambits = params.q.split(' ').filter(word => word.indexOf('taxonomy:') === 0);

            if (!gambits.length) {
                return Promise.resolve([]);
            }

            return this.loadTerms().then(() => {
                const terms = [];

                gambits.forEach(gambit => {
                    const parts = gambit.split(':');

                    if (parts.length < 3) {
                        return;
                    }

                    const term = this.allTerms.find(t => t.slug() === parts[2] && t.taxonomy().slug() === parts[1]);

                    if (term) {
                        terms.push(term);
                    }
                });

                return terms;
            });
        }
    }

    extend(flarum.extensions['fof-user-directory'].components.SearchField.prototype, 'filterTypes', function (items) {
        items.add('fof-taxonomies', new TaxonomyTermType(), 15);
    });
}
