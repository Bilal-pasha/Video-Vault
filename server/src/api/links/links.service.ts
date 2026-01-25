import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link, LinkSource } from './link.entity';
import { CreateLinkDto } from './dto/create-link.dto';
import {
  fetchOgMetadata,
  getYoutubeThumbnailUrl,
} from './utils/og-metadata.util';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
  ) {}

  async create(userId: string, dto: CreateLinkDto): Promise<Link> {
    const source = (dto.source ?? this.inferSource(dto.url)) as LinkSource;
    let title = dto.title ?? null;
    let thumbnailUrl = dto.thumbnailUrl ?? null;

    if (!thumbnailUrl || !title) {
      const og = await fetchOgMetadata(dto.url);
      if (!thumbnailUrl && og.thumbnailUrl) thumbnailUrl = og.thumbnailUrl;
      if (!title && og.title) title = og.title;
    }
    // YouTube/Shorts often don't expose og:image to server fetch; use known thumbnail URL
    if (!thumbnailUrl) {
      const ytThumb = getYoutubeThumbnailUrl(dto.url);
      if (ytThumb) thumbnailUrl = ytThumb;
    }

    const link = this.linkRepository.create({
      userId,
      url: dto.url,
      source,
      title,
      category: dto.category ?? null,
      thumbnailUrl,
    });
    return this.linkRepository.save(link);
  }

  async findAll(
    userId: string,
    opts?: { search?: string; source?: LinkSource; category?: string },
  ): Promise<Link[]> {
    const qb = this.linkRepository
      .createQueryBuilder('link')
      .where('link.user_id = :userId', { userId })
      .orderBy('link.created_at', 'DESC');

    if (opts?.source) {
      qb.andWhere('link.source = :source', { source: opts.source });
    }

    if (opts?.category?.trim()) {
      qb.andWhere('link.category = :category', {
        category: opts.category.trim(),
      });
    }

    if (opts?.search?.trim()) {
      const term = `%${opts.search.trim()}%`;
      qb.andWhere(
        '(link.url ILIKE :term OR link.title ILIKE :term)',
        { term },
      );
    }

    const links = await qb.getMany();
    // Backfill thumbnail for existing YouTube/Shorts links saved when OG returned null
    for (const link of links) {
      if (!link.thumbnailUrl) {
        const yt = getYoutubeThumbnailUrl(link.url);
        if (yt) link.thumbnailUrl = yt;
      }
    }
    return links;
  }

  private inferSource(url: string): LinkSource {
    const u = url.toLowerCase();
    if (u.includes('instagram.com')) return 'instagram';
    if (u.includes('facebook.com') || u.includes('fb.com') || u.includes('fb.me')) return 'facebook';
    if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter';
    if (u.includes('tiktok.com')) return 'tiktok';
    return 'other';
  }
}
