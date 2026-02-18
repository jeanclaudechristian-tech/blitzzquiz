import React, { createContext, useState, useContext, ReactNode } from 'react';
import api from '@/services/api'; //
import { Group, Assignment } from '@/types'; //
import { Alert } from 'react-native';

interface GroupContextType {
    groups: Group[];
    isLoading: boolean;
    fetchGroups: () => Promise<void>;
    joinGroup: (inviteCode: string) => Promise<boolean>;
    leaveGroup: (groupId: number) => Promise<void>;
}

const GroupContext = createContext<GroupContextType>({} as GroupContextType);

export function GroupProvider({ children }: { children: ReactNode }) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // 1. 获取用户所属的所有小组
    const fetchGroups = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/groups'); //
            setGroups(response.data);
            console.log("📦 小组列表同步成功");
        } catch (error) {
            console.error("💥 无法感知小组位面", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. 输入 6 位神谕代码加入小组
    const joinGroup = async (inviteCode: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            // 自动转大写，匹配后端 Str::upper 逻辑
            const cleanCode = inviteCode.trim().toUpperCase();

            const response = await api.post('/groups/join', {
                code_invitation: cleanCode
            }); //

            Alert.alert("Succès", `Vous avez rejoint : ${response.data.nom}`);
            await fetchGroups(); // 重新拉取列表，确保存储同步
            return true;
        } catch (error: any) {
            // 处理 404 (无效代码) 或 409 (已加入)
            console.log("Full Error Object:", error);
            console.log("Response Data:", error.response?.data);
            const message = error.response?.data?.error || "Code invalide";
            Alert.alert("Erreur", message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // 3. 退出小组：学生主动切断契约
    const leaveGroup = async (groupId: number) => {
        try {
            await api.delete(`/groups/${groupId}/leave`); //
            await fetchGroups();
        } catch (error) {
            Alert.alert("Erreur", "Impossible de quitter le groupe");
        }
    };

    return (
        <GroupContext.Provider value={{ groups, isLoading, fetchGroups, joinGroup, leaveGroup }}>
            {children}
        </GroupContext.Provider>
    );
}

export const useGroups = () => useContext(GroupContext);

