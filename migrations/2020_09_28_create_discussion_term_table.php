<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->create('fof_discussion_taxonomy_term', function (Blueprint $table) {
            $table->unsignedInteger('discussion_id');
            $table->unsignedInteger('term_id');
            $table->timestamps();

            $table->primary(['discussion_id', 'term_id'], 'dtid');

            $table->foreign('discussion_id', 'did')->references('id')->on('discussions')->onDelete('cascade');
            $table->foreign('term_id', 'tid')->references('id')->on('fof_taxonomy_terms')->onDelete('cascade');
        });
    },
    'down' => function (Builder $schema) {
        $schema->dropIfExists('fof_discussion_taxonomy_term');
    },
];
