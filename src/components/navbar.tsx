// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User, Session } from '@supabase/auth-helpers-nextjs';

interface NavbarProps {
 session?: Session | null;
}

export default function Navbar({ session }: NavbarProps) {
 const router = useRouter();
 const [user, setUser] = useState<User | null>(session?.user || null);
 const supabase = createClientComponentClient();

 useEffect(() => {
   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
     setUser(session?.user ?? null);
   });

   return () => subscription.unsubscribe();
 }, [supabase]);

 const handleSignOut = async () => {
   await supabase.auth.signOut();
   router.push('/');
   router.refresh();
 };

 return (
   <nav className="bg-white border-b">
     <div className="max-w-7xl mx-auto px-4">
       <div className="flex justify-between h-16">
         <Link href="/" className="flex items-center">
           <span className="text-blue-600 text-xl font-bold">LessonPlannerAI</span>
         </Link>
         
         <div className="flex items-center">
           {user ? (
             <div className="flex items-center space-x-4">
               <Link href="/dashboard" className="text-gray-900 hover:text-gray-700">
                 Dashboard
               </Link>
               <button
                 onClick={handleSignOut}
                 className="bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium border"
               >
                 Sign out
               </button>
             </div>
           ) : (
             <div className="flex items-center space-x-4">
               <Link href="/login" className="text-blue-600 hover:text-blue-500">
                 Login
               </Link>
               <Link
                 href="/register"
                 className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
               >
                 Register
               </Link>
             </div>
           )}
         </div>
       </div>
     </div>
   </nav>
 );
}