// biome-ignore lint/nursery/noRestrictedImports: <explanation>
import NextImage from 'next/image';
import { cn } from '#utils/cn';

// biome-ignore lint/nursery/noRestrictedImports: <explanation>
import type { ImageProps } from 'next/image';

interface ExtendedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  backgroundImage?: boolean;
  useCdn?: boolean;
  containerHeight?: string;
}

const DEFAULT_SIZES = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

const getImageUrl = (src: string, useCdn: boolean): string => {
  if (useCdn && (src.startsWith('http://') || src.startsWith('https://'))) {
    const cdnDomain = process.env.NEXT_PUBLIC_IMAGE_CDN;

    return `${cdnDomain}/${encodeURIComponent(src)}`;
  }
  return src;
};

const aspectRatioClasses = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-4/3',
  '16:9': 'aspect-video',
  '21:9': 'aspect-[21/9]',
};

const objectFitClasses = {
  contain: 'object-contain',
  cover: 'object-cover',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
};

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export function Image({
  src,
  aspectRatio,
  objectFit = 'cover',
  rounded = 'none',
  backgroundImage = false,
  useCdn = false,
  priority = false,
  quality = 85,
  placeholder,
  blurDataURL,
  fill = false,
  sizes = DEFAULT_SIZES,
  className,
  containerHeight = '200px',
  ...props
}: ExtendedImageProps) {
  const imageUrl = getImageUrl(src, useCdn);

  const imageClasses = cn(
    'w-full h-full transition-opacity duration-300',
    objectFitClasses[objectFit],
    roundedClasses[rounded],
    className
  );

  const containerClasses = cn(
    'relative overflow-hidden',
    fill && !containerHeight && 'h-64', // Default height when fill is true and no containerHeight provided
    aspectRatio && aspectRatioClasses[aspectRatio],
    roundedClasses[rounded],
    className
  );

  const containerStyles = {
    height: containerHeight,
  };

  const commonProps = {
    src: imageUrl,
    alt: props.alt || '',
    quality,
    priority,
    sizes,
    ...(placeholder && { placeholder }),
    ...(blurDataURL && { blurDataURL }),
  };

  if (fill || backgroundImage || aspectRatio) {
    return (
      <div className={containerClasses} style={containerStyles}>
        <NextImage {...commonProps} fill className={imageClasses} {...props} />
      </div>
    );
  }

  return <NextImage className={imageClasses} {...commonProps} {...props} />;
}
