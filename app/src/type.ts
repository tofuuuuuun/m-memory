import "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresAt: number;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: number;
    }
}

export type Tokens = {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
};

export type Artist = {
    name: string;
};

export type TrackItem = {
    track: {
        name: string;
        artists: Artist[];
    };
};

