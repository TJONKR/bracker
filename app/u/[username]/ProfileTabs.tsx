'use client';

import { useState } from 'react';
import Tabs from '@/components/ui/Tabs';
import FeedList from '@/components/feed/FeedList';
import LevelList from '@/components/profile/LevelList';
import StatsGrid from '@/components/profile/StatsGrid';

interface Build {
  id: string;
  repo?: string;
  commitMessage?: string;
  xpEarned: number;
  streak: number;
  linesChanged: number;
  createdAt: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  emoji?: string;
}

interface Post {
  id: string;
  url: string;
  platform: string;
  content?: string;
  xpEarned: number;
  createdAt: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  emoji?: string;
}

interface ProfileTabsProps {
  builds: Build[];
  posts: Post[];
  totalXp: number;
  totalBuilds: number;
  totalPosts: number;
  totalTokens: number;
  currentStreak: number;
  postCount: number;
}

const TABS = ['Builds', 'Posts', 'Levels', 'Stats'];

export default function ProfileTabs({
  builds,
  posts,
  totalXp,
  totalBuilds,
  totalPosts,
  totalTokens,
  currentStreak,
  postCount,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('Builds');

  return (
    <>
      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="feed">
        {activeTab === 'Builds' && (
          <FeedList builds={builds} posts={[]} tab="builds" />
        )}
        {activeTab === 'Posts' && (
          <FeedList builds={[]} posts={posts} tab="posts" />
        )}
        {activeTab === 'Levels' && (
          <LevelList />
        )}
        {activeTab === 'Stats' && (
          <StatsGrid
            totalXp={totalXp}
            totalBuilds={totalBuilds}
            totalPosts={totalPosts}
            totalTokens={totalTokens}
            currentStreak={currentStreak}
            postCount={postCount}
          />
        )}
      </div>
    </>
  );
}
