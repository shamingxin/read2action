import type { Project } from "@/types";

const now = "2026-05-01T08:00:00.000Z";

export const mockProjects: Project[] = [
  {
    id: "new",
    name: "新项目",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "1",
    name: "默认项目",
    description: "通用验收项目",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sha",
    name: "沙",
    description: "默认试验项目",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "project-one",
    name: "项目一",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "baidu-wenku",
    name: "百度文库",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "xuanxuan",
    name: "旋旋又转转",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "industrial",
    name: "工业设备",
    createdAt: now,
    updatedAt: now,
  },
];

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((p) => p.id === id);
}
