export interface UploadReviewImageInput {
  readonly reviewId: string;
  readonly mediaId: string;
  readonly content: Uint8Array;
  readonly contentType: string;
}

export interface UploadedReviewImage {
  readonly url: string;
  readonly mediaType: string;
}

export interface IReviewImageStorage {
  upload(input: UploadReviewImageInput): Promise<UploadedReviewImage>;
}
