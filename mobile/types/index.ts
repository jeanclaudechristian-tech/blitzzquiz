// 1. 用户 (对应 User.php)
export interface User {
    id: number;
    email: string;
    nickname: string;
    role: 'admin' | 'student' | 'teacher' | string; // 根据你的逻辑调整
    avatar?: string | null;
    google_id?: string | null;
    apple_id?: string | null;
    created_at: string; // Laravel 返回的时间通常是 ISO 字符串
    updated_at: string;
}

// 2. 测验 (对应 Quiz.php)
export interface Quiz {
    id: number;
    owner_id: number;
    titre: string;       // 注意：保持和 PHP 里的命名一致
    description?: string | null;
    is_public: boolean;  // Laravel 的 0/1 会被转成 boolean (如果在 casts 定义了) 或 number
    code_quiz: string;
    created_at: string;
    updated_at: string;

    // 关联关系 (可选，因为 API 不一定每次都把这些带回来)
    owner?: User;
    questions?: Question[];
    results?: Result[];
}

// 3. 问题 (对应 Question.php)
export interface Question {
    id: number;
    quiz_id: number;
    type: 'multiple_choice' | 'true_false' | string; // 题目类型
    texte: string;
    explanation?: string | null;
    metadata: any; // PHP 里 casts 为 array，这里可以是任意 JSON 结构
    created_at: string;
    updated_at: string;
}

// 4. 群组 (对应 Group.php)
export interface Group {
    id: number;
    owner_id: number;
    nom: string;
    code_invitation: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    nb_membres?: number;

    owner?: User;
    members?: User[];
}

// 5. 作业/分配 (对应 Assignment.php)
export interface Assignment {
    id: number;
    quiz_id: number;
    group_id: number;
    assigned_at: string;
    created_at: string;
    updated_at: string;

    quiz?: Quiz;
    group?: Group;
}

// 6. 结果 (对应 Result.php)
export interface Result {
    id: number;
    user_id: number;
    quiz_id: number;
    score: number;
    date_tentative: string;
    created_at: string;
    updated_at: string;

    quiz?: Quiz;
}