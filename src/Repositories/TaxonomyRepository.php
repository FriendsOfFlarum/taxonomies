<?php

namespace FoF\Taxonomies\Repositories;

use Flarum\Foundation\ValidationException;
use FoF\Taxonomies\Taxonomy;
use FoF\Taxonomies\Validators\TaxonomyValidator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

class TaxonomyRepository
{
    protected $taxonomy;
    protected $validator;

    public function __construct(Taxonomy $taxonomy, TaxonomyValidator $validator)
    {
        $this->taxonomy = $taxonomy;
        $this->validator = $validator;
    }

    protected function query(): Builder
    {
        return $this->taxonomy->newQuery()
            ->orderBy('order')
            ->orderBy('name');
    }

    /**
     * @param $id
     * @param string $type
     * @return Model|Taxonomy
     */
    public function findIdOrFail($id, $type = null): Taxonomy
    {
        $query = $this->taxonomy->newQuery();

        if ($type) {
            $query->where('type', $type);
        }

        return $query->findOrFail($id);
    }

    /**
     * @param string $slug
     * @param string $type
     * @return Model|Taxonomy
     */
    public function findSlugOrFail(string $slug, $type = null): Taxonomy
    {
        $query = $this->taxonomy->newQuery();

        if ($type) {
            $query->where('type', $type);
        }

        return $query->where('slug', $slug)->firstOrFail();
    }

    /**
     * @return Collection|Taxonomy[]
     */
    public function all(): Collection
    {
        return $this->query()->get();
    }

    public function store(array $attributes): Taxonomy
    {
        $this->validator->type = Arr::get($attributes, 'type');
        $this->validator->assertValid($attributes);

        $taxonomy = new Taxonomy($attributes);
        $taxonomy->save();

        return $taxonomy;
    }

    public function update(Taxonomy $taxonomy, array $attributes): Taxonomy
    {
        $this->validator->type = $taxonomy->type;
        $this->validator->ignore = $taxonomy;
        $this->validator->assertValid($attributes);

        $taxonomy->fill($attributes);

        if ($taxonomy->isDirty('type')) {
            throw new ValidationException([
                // Not translated on purpose. This message should never show up because the UI doesn't offer the field for edit
                'type' => 'Cannot change type of existing taxonomy',
            ]);
        }

        $taxonomy->save();

        return $taxonomy;
    }

    public function delete(Taxonomy $taxonomy)
    {
        $taxonomy->delete();
    }

    public function sorting(array $order)
    {
        $this->taxonomy->newQuery()->update([
            'order' => null,
        ]);

        foreach ($order as $index => $taxonomyId) {
            $this->taxonomy
                ->newQuery()
                ->where('id', $taxonomyId)
                ->update(['order' => $index + 1]);
        }
    }
}
