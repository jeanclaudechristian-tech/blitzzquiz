// services/GroupDetailContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import api from '@/services/api';
import { Group } from '@/types';

interface GroupDetailContextType {
    fullGroup: Group | null;
    isLoading: boolean;
    loadGroupDetail: (id: number) => Promise<void>;
}

const GroupDetailContext = createContext<GroupDetailContextType>({} as GroupDetailContextType);

export function GroupDetailProvider({ children }: { children: ReactNode }) {
    const [fullGroup, setFullGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadGroupDetail = async (id: number) => {
        setIsLoading(true);
        try {
            // 调用后端的 show 接口
            const response = await api.get(`/groups/${id}`);
            setFullGroup(response.data);
        } catch (error) {
            console.error("💥 深度感知失败", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <GroupDetailContext.Provider value={{ fullGroup, isLoading, loadGroupDetail }}>
            {children}
        </GroupDetailContext.Provider>
    );
}

export const useGroupDetail = () => useContext(GroupDetailContext);