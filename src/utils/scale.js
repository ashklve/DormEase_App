import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

export const W = width;
export const H = height;
export const scale = (size) => (width / 375) * size;
export const verticalScale = (size) => (height / 812) * size;
export const moderateScale = (size, factor = 0.5) =>
    size + (scale(size) - size) * factor;
