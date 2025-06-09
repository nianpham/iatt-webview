const BASE_URL = "https://api.farmcode.io.vn/v1";
// const BASE_URL = 'http://localhost:8000/api/v1';

const ORDER = {
  CREATE_ALBUM: `${BASE_URL}/inanhtructuyen/temp-order-album/`,
};

const MOBILE = {
  SMOOTH_SKIN: `${BASE_URL}/inanhtructuyen/helper/smooth-skin`,
  REMOVE_BACKGROUND: `${BASE_URL}/inanhtructuyen/helper/background-remove`,
  INCREASE_QUALITY: `${BASE_URL}/inanhtructuyen/helper/enhance`,
  IMAGE_AI: `${BASE_URL}/inanhtructuyen/helper/image-ai`,
};

export const API = {
  ORDER,
  MOBILE,
};
