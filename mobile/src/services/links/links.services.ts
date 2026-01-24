import { useQuery } from '@tanstack/react-query';
import { httpPrivate } from '../axiosConfig';
import { API_ENDPOINTS } from '@/utils/api.endpoints';
import type {
  SavedLink,
  CreateLinkRequest,
  ApiLinkResponse,
  LinkSource,
  LinkCategory,
} from './links.types';

export const linksService = {
  async create(payload: CreateLinkRequest): Promise<ApiLinkResponse> {
    const { data } = await httpPrivate.post<ApiLinkResponse>(
      API_ENDPOINTS.LINKS,
      payload,
    );
    return data;
  },

  async list(opts?: {
    search?: string;
    source?: LinkSource;
    category?: string;
  }): Promise<SavedLink[]> {
    const params = new URLSearchParams();
    if (opts?.search) params.set('search', opts.search);
    if (opts?.source) params.set('source', opts.source);
    if (opts?.category) params.set('category', opts.category);
    const qs = params.toString();
    const url = qs ? `${API_ENDPOINTS.LINKS_LIST}?${qs}` : API_ENDPOINTS.LINKS_LIST;
    const { data } = await httpPrivate.get<ApiLinkResponse>(url);
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error(data.message || 'Failed to fetch links');
    }
    return data.data as SavedLink[];
  },
};

export function useLinks(opts?: {
  search?: string;
  source?: LinkSource;
  category?: LinkCategory | '';
}) {
  return useQuery({
    queryKey: [
      'links',
      opts?.search ?? '',
      opts?.source ?? '',
      opts?.category ?? '',
    ],
    queryFn: () => linksService.list(opts),
  });
}
