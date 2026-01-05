import { useUser, useClerk } from '@clerk/nextjs';

export const useAuth = () => {
    const { user, isLoaded, isSignedIn } = useUser();
    const { signOut, openSignUp, openSignIn } = useClerk();

    const signIn = (options?: any) => {
        openSignIn(options);
    };

    const signUp = (options?: any) => {
        openSignUp(options);
    };

    const logout = async () => {
        await signOut();
    };

    return {
        user,
        isLoaded,
        isSignedIn,
        signIn,
        signUp,
        logout,
        userId: user?.id,
        email: user?.primaryEmailAddress?.emailAddress,
        name: user?.fullName,
        avatar: user?.imageUrl,
    };
};
