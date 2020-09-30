import extract from 'flarum/utils/extract';
import termLabel from './termLabel';
import sortTerms from '../utils/sortTerms';

/* global m */

export default function tagsLabel(terms, attrs = {}) {
    const children = [];
    const link = extract(attrs, 'link');

    attrs.className = 'TaxonomiesLabel ' + (attrs.className || '');

    if (terms) {
        let taxonomy = extract(attrs, 'taxonomy');

        if (!taxonomy) {
            taxonomy = terms[0].taxonomy();
        }

        if (taxonomy && taxonomy.showLabel()) {
            children.push(termLabel(taxonomy, {
                className: 'TaxonomyParentLabel',
            }));
        }

        sortTerms(terms).forEach(tag => {
            if (tag || terms.length === 1) {
                children.push(termLabel(tag, {link}));
            }
        });
    } else {
        children.push(termLabel());
    }

    return m('span', attrs, children);
}
