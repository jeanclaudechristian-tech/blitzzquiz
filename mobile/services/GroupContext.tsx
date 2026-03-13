import React, { createContext, useState, useContext, ReactNode } from 'react';
import api from '@/services/api'; //
import { Group, Assignment, Quiz } from '@/types'; //
import { Alert } from 'react-native';


interface GroupContextType {
    groups: Group[];
    isLoading: boolean;
    fetchGroups: () => Promise<void>;
    joinGroup: (inviteCode: string) => Promise<boolean>;
    leaveGroup: (groupId: number) => Promise<void>;
    deleteGroup: (groupId: number) => Promise<void>;
    fetchGroupQuizzes: (groupId: number) => Promise<Quiz[]>;
    fetchRanking: (groupId: number, quizId: number) => Promise<any[] | undefined>;
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

    const deleteGroup = async (groupId: number) => {
        try {
            await api.delete(`/groups/${groupId}/destroy`); // 对应 destroy 方法
            Alert.alert("Succès", "Le groupe a été dissous.");
            await fetchGroups(); // 刷新列表，抹除痕迹
        } catch (error) {
            Alert.alert("Erreur", "Seul l'owner peut supprimer ce groupe.");
        }
    };

    const fetchGroupQuizzes = async (groupId: number): Promise<Quiz[]> => {
        try {
            // 调用 Laravel 后端的 /groups/{group}/quizzes 接口
            const response = await api.get(`/groups/${groupId}/quizzes`);
            console.log("📜 群组试炼列表拉取成功");
            return response.data; // 返回获取到的测验数组
        } catch (error) {
            console.error("💥 无法感知该群组的测验位面", error);
            Alert.alert("Erreur", "Impossible de charger les quiz de ce groupe.");
            return []; // 发生错误时返回空数组，防止前端崩溃
        }
    };

    const fetchRanking = async (groupId: number, quizId: number) => {
        try {
            const response = await api.get(`/groups/${groupId}/quizzes/${quizId}/ranking`);
            return response.data; // 这里面就是按分数排好序的数组啦！
        } catch (error) {
            console.error("无法获取神圣排名榜", error);
        }
    }

    return (
        <GroupContext.Provider value={{ groups, isLoading, fetchGroups, joinGroup, leaveGroup, deleteGroup, fetchGroupQuizzes, fetchRanking }}>
            {children}
        </GroupContext.Provider>
    );
}

export const useGroups = () => useContext(GroupContext);

