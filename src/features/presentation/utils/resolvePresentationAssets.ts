const PRESENTATION_ASSET_MODULES = import.meta.glob('/src/presentations/**/assets/**/*.{png,jpg,jpeg,gif,svg,webm,mp4}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const PRESENTATION_ASSET_MAP: Record<string, string> = Object.entries(PRESENTATION_ASSET_MODULES).reduce(
  (acc, [absolutePath, assetUrl]) => {
    const normalizedPath = absolutePath.replace(/\\/g, '/');
    const assetsStartIndex = normalizedPath.indexOf('/assets/');
    if (assetsStartIndex < 0) {
      return acc;
    }

    const markdownAssetPath = normalizedPath.slice(assetsStartIndex + 1);
    acc[markdownAssetPath] = assetUrl;
    return acc;
  },
  {} as Record<string, string>
);

export const resolvePresentationAssets = (markdown: string): string => {
  let result = markdown;

  for (const [assetPath, assetUrl] of Object.entries(PRESENTATION_ASSET_MAP)) {
    result = result.split(assetPath).join(assetUrl);
  }

  return result;
};
