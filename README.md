# Taxonomies by FriendsOfFlarum

> Migrated to a new namespace. See https://github.com/flamarkt/taxonomies

![License](https://img.shields.io/badge/license-MIT-blue.svg) [![Latest Stable Version](https://img.shields.io/packagist/v/fof/taxonomies.svg)](https://packagist.org/packages/fof/taxonomies)

Adds custom taxonomies to discussions.

Taxonomies are like tag sets.
Taxonomy "tags" are called Terms.

Each Taxonomy has its own rules on how many Terms are required/allowed.

You can allow the users to create custom Terms under some Taxonomies.

Taxonomies and Terms can be used to filter the list of discussions or just store and display particular information about discussion.

A global permission controls who can see and use all taxonomies.
Per-taxonomy permissions are currently not available.

The Taxonomies extension can work alongside Flarum's Tags extension, or be used in place of it.
Unfortunately all extensions that implement custom Tag feature won't automatically work with Taxonomies (like the ability to follow Tags).

## Installation

```bash
composer require fof/taxonomies
```

## Updating

```bash
composer require fof/taxonomies
php flarum migrate
php flarum cache:clear
```

## Configuration

Once enabled, a new Taxonomies tab will show up in the admin.

Taxonomies are shown as tabs, while Terms are shown in a list in the Taxonomy tab.

Taxonomies and Terms can be re-ordered by drag-and-drop (horizontally for Taxonomies, vertically for Terms).

If you don't re-order Terms, they will appear alphabetically.
If you have a large number of Terms or allow user-created Terms, it's recommended to not order them and leave them in automatic ordering.

An identical Term can be created in multiple Taxonomies.
Even slugs can be re-used across Taxonomies, they only need to be unique inside of that Taxonomy.

Slugs are used for search queries and as part of some URLs.
You should avoid reserved terms in Taxonomy slugs, like `tag`, `tags`, `page`, `limit`, `include`, `sort`, `q` as these might conflict with Flarum or other extensions.

The Taxonomy and Term descriptions are shown in the "choose terms" modal.
Taxonomy description appears above the search field, while Term description appears next to the term.
The descriptions might also be used for SEO improvements in a future release.

When a Term is deleted from the admin panel, it is removed from all discussions that used it.
When a Taxonomy is deleted from the admin panel, all its Terms are removed from discussions that used it.
Discussions are not deleted.

## Possible improvements

The terms API currently doesn't use pagination.
With large numbers of user-created terms, loading the "choose term" modal or filter dropdown for those taxonomies could hit performance issues.

More integration with Tags is possible, but requires a lot of work.
Restricting a Taxonomy to particular Tags, or linking Terms to Tags to gain Tag-compatible features won't be easy to implement.

## Links

- [Flarum Discuss post](https://discuss.flarum.org/)
- [Source code on GitHub](https://github.com/FriendsOfFlarum/taxonomies)
- [Report an issue](https://github.com/FriendsOfFlarum/taxonomies/issues)
- [Download via Packagist](https://packagist.org/packages/fof/taxonomies)

An extension by [FriendsOfFlarum](https://github.com/FriendsOfFlarum)
