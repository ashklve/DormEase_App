import {
    loadModel,
    unload,
} from 'react-native-vosk';

let loadedModel = null;
let loadingModel = null;
let loadingPromise = null;

export const ensureVoskModelLoaded = (modelName) => {
    if (loadedModel === modelName) {
        return Promise.resolve();
    }

    if (loadingModel === modelName && loadingPromise) {
        return loadingPromise;
    }

    unload();
    loadedModel = null;
    loadingModel = modelName;

    loadingPromise = loadModel(modelName)
        .then(() => {
            if (loadingModel === modelName) {
                loadedModel = modelName;
            }
        })
        .catch((error) => {
            if (loadingModel === modelName) {
                loadedModel = null;
            }
            throw error;
        })
        .finally(() => {
            if (loadingModel === modelName) {
                loadingModel = null;
                loadingPromise = null;
            }
        });

    return loadingPromise;
};

export const unloadVoskModel = () => {
    loadedModel = null;
    loadingModel = null;
    loadingPromise = null;
    unload();
};
