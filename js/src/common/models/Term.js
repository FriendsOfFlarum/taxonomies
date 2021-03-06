import Model from 'flarum/Model';

export default class Term extends Model {
    name = Model.attribute('name');
    slug = Model.attribute('slug');
    description = Model.attribute('description');
    color = Model.attribute('color');
    icon = Model.attribute('icon');
    order = Model.attribute('order');
    createdAt = Model.attribute('createdAt', Model.transformDate);

    taxonomy = Model.hasOne('taxonomy');
}
