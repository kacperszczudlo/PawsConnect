import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

const BUCKET_NAME = 'animals';

export const uploadImage = async (
  asset: ImagePicker.ImagePickerAsset,
  folder: string = 'uploads',
): Promise<string | null> => {
  try {
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
    let fileToUpload: Blob | File | ArrayBuffer;

    if (Platform.OS === 'web') {
      if (!asset.uri) {
        console.error('No URI provided for web image');
        return null;
      }

      const response = await fetch(asset.uri);
      fileToUpload = await response.blob();
    } else {
      if (!asset.uri) {
        console.error('No URI provided for native image');
        return null;
      }

      // Hermes/React Native may throw when creating Blob from ArrayBufferView.
      // Upload an ArrayBuffer directly from the local file URI instead.
      const response = await fetch(asset.uri);
      fileToUpload = await response.arrayBuffer();
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileToUpload, {
        contentType: asset.mimeType || 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Image upload error:', error);
      return null;
    }

    if (!data?.path) {
      console.error('No path returned from upload');
      return null;
    }

    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicData?.publicUrl || null;
  } catch (error) {
    console.error('Image upload exception:', error);
    return null;
  }
};

export const uploadAnimalImage = async (
  asset: ImagePicker.ImagePickerAsset,
  shelterId: string,
): Promise<string | null> => {
  return uploadImage(asset, shelterId);
};

export const uploadAvatarImage = async (
  asset: ImagePicker.ImagePickerAsset,
  userId: string,
): Promise<string | null> => {
  return uploadImage(asset, `avatars/${userId}`);
};
