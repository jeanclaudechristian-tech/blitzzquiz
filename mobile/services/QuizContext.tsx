import React, { createContext, useState, useContext, ReactNode } from 'react';
import api from '@/services/api';
import { Quiz, Question, Result } from '@/types';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

interface QuizContextType {
    quizzes: Quiz[];           // 首页推荐列表
    isLoading: boolean;
    currentQuestions: Question[]; // 当前正在进行的题目
    fetchQuizzes: (offset?: number, limit?: number, append?: boolean) => Promise<Quiz[]>;
    findQuizByCode: (code: string) => Promise<Quiz | null>;
    fetchQuestions: (quizId: number) => Promise<Question[] | null>;
    submitScore: (quizId: number, score: number) => Promise<boolean>;
    searchQuizzes: (query: string) => Promise<Quiz[]>;
}

const QuizContext = createContext<QuizContextType>({} as QuizContextType);

export function QuizProvider({ children }: { children: ReactNode }) {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { refreshResults } = useAuth(); // 提交成绩后刷新全局成绩

    // 1. 获取首页推荐 (基于用户的 education_level)
    const fetchQuizzes = async (offset = 0, limit = 5, append = false) => {
        setIsLoading(true); // 这里建议只在 offset 为 0 时设为 true，或者新增一个 isMoreLoading
        try {
            const response = await api.get(`/quizzes?offset=${offset}&limit=${limit}`);
            const newData = response.data;

            if (append) {
                // ✅ 追加位面数据
                setQuizzes(prev => [...prev, ...newData]);
            } else {
                // ✅ 刷新位面数据
                setQuizzes(newData);
            }
            return newData; // 返回数据供 UI 判断是否“还有更多”
        } catch (error) {
            console.error("💥 无法感知测验位面", error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // 2. 通过 6 位代码查找 Quiz (不带题目，用于预览/确认)
    const findQuizByCode = async (code: string): Promise<Quiz | null> => {
        try {
            // 对接 QuizController::findByCode
            const response = await api.get(`/quizzes/code/${code.toUpperCase()}`);
            return response.data;
        } catch (error) {
            console.log("🔍 代码无效或 Quiz 不存在");
            return null;
        }
    };

    // 3. 开始答题：获取题目列表
    const fetchQuestions = async (quizId: number) => {
        try {
            const response = await api.get(`/quizzes/${quizId}/questions`);
            setCurrentQuestions(response.data);
            // ✅ 必须 return，否则 handleStartQuiz 里的 success 永远是 undefined
            return response.data;
        } catch (error) {
            console.error("❌ 无法获取题目:", error);
            return null; // 失败返回 null
        }
    };

    // 4. 提交成绩 (限 STUDENT 角色)
    const submitScore = async (quizId: number, score: number): Promise<boolean> => {
        try {
            // 对接 QuizController::storeResult
            await api.post(`/quizzes/${quizId}/results`, { score });
            await refreshResults(); // 答题完立马同步全局成绩状态
            return true;
        } catch (error) {
            console.error("💥 成绩上传失败", error);
            return false;
        }
    };

    // 5. 发现页：全文搜索
    const searchQuizzes = async (query: string): Promise<Quiz[]> => {
        if (query.length < 2) return [];
        try {
            // 对接 QuizController::search
            const response = await api.get(`/quizzes/search?q=${query}`);
            return response.data;
        } catch (error) {
            console.error("🔎 搜索失败", error);
            return [];
        }
    };

    return (
        <QuizContext.Provider value={{
            quizzes,
            isLoading,
            currentQuestions,
            fetchQuizzes,
            findQuizByCode,
            fetchQuestions,
            submitScore,
            searchQuizzes
        }}>
            {children}
        </QuizContext.Provider>
    );
}

export const useQuizzes = () => useContext(QuizContext);