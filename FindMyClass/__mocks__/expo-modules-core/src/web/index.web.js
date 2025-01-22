
export const Platform = {
  OS: 'web',
  select: (options) => options.web || options.default,
};

export const canUseDOM = true;
export const canUseEventListeners = true;
export const canUseViewport = true;