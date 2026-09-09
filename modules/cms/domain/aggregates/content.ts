import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { CmsDomainError } from '../errors/cms-domain.error';
import { ContentCreatedEvent } from '../events/content-created.event';
import { ContentPublishedEvent } from '../events/content-published.event';
import { ContentUpdatedEvent } from '../events/content-updated.event';

export enum ContentStatus { DRAFT = 'draft', PUBLISHED = 'published', ARCHIVED = 'archived' }

export class Content extends AggregateRoot<string> {
  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private slug: string, private title: string,
    private body: string, private status: ContentStatus,
  ) { super(id, createdAt, updatedAt); }

  static create(id: string, slug: string, title: string, body: string): Result<Content, CmsDomainError> {
    if (!slug?.trim() || !title?.trim()) {
      return Result.fail(new CmsDomainError('Slug and title are required', 'INVALID_CONTENT'));
    }
    const now = new Date();
    const content = new Content(id, now, now, slug.trim(), title.trim(), body ?? '', ContentStatus.DRAFT);
    content.addDomainEvent(new ContentCreatedEvent(id, now, { slug: slug.trim(), title: title.trim() }));
    return Result.ok(content);
  }

  static reconstitute(props: {
    id: string; slug: string; title: string; body: string; status: ContentStatus;
    createdAt: Date; updatedAt: Date;
  }): Content {
    return new Content(props.id, props.createdAt, props.updatedAt, props.slug, props.title, props.body, props.status);
  }

  update(title: string, body: string): Result<void, CmsDomainError> {
    if (this.status === ContentStatus.ARCHIVED) {
      return Result.fail(new CmsDomainError('Archived content cannot be updated', 'CONTENT_ARCHIVED'));
    }
    if (!title?.trim()) {
      return Result.fail(new CmsDomainError('Title is required', 'INVALID_TITLE'));
    }
    this.title = title.trim();
    this.body = body ?? '';
    this.updatedAt = new Date();
    this.addDomainEvent(new ContentUpdatedEvent(this.id, new Date(), {}));
    return Result.ok(undefined);
  }

  publish(): Result<void, CmsDomainError> {
    if (this.status === ContentStatus.PUBLISHED) {
      return Result.fail(new CmsDomainError('Content is already published', 'CONTENT_ALREADY_PUBLISHED'));
    }
    if (this.status === ContentStatus.ARCHIVED) {
      return Result.fail(new CmsDomainError('Archived content cannot be published', 'CONTENT_ARCHIVED'));
    }
    this.status = ContentStatus.PUBLISHED;
    this.updatedAt = new Date();
    this.addDomainEvent(new ContentPublishedEvent(this.id, new Date(), {}));
    return Result.ok(undefined);
  }

  getSlug(): string { return this.slug; }
  getTitle(): string { return this.title; }
  getBody(): string { return this.body; }
  getStatus(): ContentStatus { return this.status; }
}
