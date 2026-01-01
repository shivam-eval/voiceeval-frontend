/**
 * React Query hooks for Generation APIs.
 */
import { useMutation } from '@tanstack/react-query';
import { generationApi } from '../utils/api';

export const useGenerateFlow = () => {
    return useMutation({
        mutationFn: (data) => generationApi.generateFlow(data),
    });
};

export const useGenerateTestSuite = () => {
    return useMutation({
        mutationFn: (data) => generationApi.generateTestSuite(data),
    });
};

export const useGenerateFromAudio = () => {
    return useMutation({
        mutationFn: (data) => generationApi.generateFromAudio(data),
    });
};

export const useGenerateMermaid = () => {
    return useMutation({
        mutationFn: (data) => generationApi.generateMermaid(data),
    });
};
