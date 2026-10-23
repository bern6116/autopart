"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";
import type { AuthSnapshot } from "@/lib/auth";

type AuthContextValue = AuthSnapshot & { refreshProfile:()=>Promise<void>; signOut:()=>Promise<void> };
const AuthContext=createContext<AuthContextValue|null>(null);

async function fetchProfile(user:User) {
  const result=await supabase.from("profiles").select("id,email,first_name,middle_name,last_name,phone,avatar_url,role,is_active,last_login,created_at,updated_at").eq("id",user.id).maybeSingle();
  if(result.error) throw new Error(`Profile lookup failed: ${result.error.message}`);
  if(!result.data) throw new Error("No account profile is linked to this authenticated user.");
  return result.data as Profile;
}

export function AuthProvider({children}:{children:React.ReactNode}) {
  const [state,setState]=useState<AuthSnapshot>({user:null,profile:null,loading:true,error:null});
  const resolve=useCallback(async(user:User|null)=>{if(!user){setState({user:null,profile:null,loading:false,error:null});return;}try{const profile=await fetchProfile(user);setState({user,profile,loading:false,error:profile.is_active?null:"This account is inactive."});}catch(e){setState({user,profile:null,loading:false,error:e instanceof Error?e.message:"Unable to load account profile."});}},[]);
  useEffect(()=>{let active=true;void supabase.auth.getUser().then(({data,error})=>{if(!active)return;if(error){setState({user:null,profile:null,loading:false,error:error.message});return;}void resolve(data.user);});const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{void resolve(session?.user??null);});return()=>{active=false;subscription.unsubscribe();};},[resolve]);
  const refreshProfile=useCallback(async()=>{const {data}=await supabase.auth.getUser();await resolve(data.user);},[resolve]);
  const signOut=useCallback(async()=>{const {error}=await supabase.auth.signOut({scope:"local"});if(error)throw error;setState({user:null,profile:null,loading:false,error:null});},[]);
  return <AuthContext.Provider value={{...state,refreshProfile,signOut}}>{children}</AuthContext.Provider>;
}

export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error("useAuth must be used within AuthProvider");return value;}
