import type { Asset } from 'react-native-image-picker';
import { getImageUrl } from '../../../config/appConfig';
import { eventService } from '../../../core/events/services/event';
import type { EventMediaUploadRequest, EventPresignedUploadResponse } from '../../../core/events/types/event';

export async function uploadEventCoverImage(eventId: string, coverImage: Asset): Promise<void> {
  if (!coverImage?.uri) return;

  const coverUploadRequest: EventMediaUploadRequest = {
    fileName: coverImage.fileName || 'cover-image.jpg',
    contentType: coverImage.type || 'image/jpeg',
    category: 'cover',
    isPublic: true,
    description: 'Event cover image',
  };

  const coverPresign: EventPresignedUploadResponse = await eventService.createCoverImageUpload(
    eventId,
    coverUploadRequest,
  );

  const imageResponse = await fetch(coverImage.uri);
  const blob = await imageResponse.blob();

  const uploadUrl = getImageUrl(coverPresign.uploadUrl) ?? coverPresign.uploadUrl;
  const uploadResponse = await fetch(uploadUrl, {
    method: coverPresign.uploadMethod || 'PUT',
    body: blob,
    headers: coverPresign.headers,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload image to S3');
  }

  await eventService.completeCoverImageUploadBody(eventId, {
    coverId: coverPresign.mediaId,
    upload: {
      objectKey: coverPresign.objectKey,
      resourceUrl: coverPresign.resourceUrl,
      fileName: coverUploadRequest.fileName,
      contentType: coverUploadRequest.contentType,
      category: coverUploadRequest.category,
      isPublic: coverUploadRequest.isPublic,
      description: coverUploadRequest.description,
    },
  });
}
