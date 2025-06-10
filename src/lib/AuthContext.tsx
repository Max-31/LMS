// import React, { createContext, useContext, useEffect, useState } from 'react';

// export type UserRole = 'student' | 'librarian' | 'admin' | 'faculty' | 'guest';

// interface UserData {
//   id: string;
//   name: string;
//   email: string;
//   role: UserRole;
//   department: string;
//   memberSince: string;
//   studentId?: string;
//   isActive: boolean;
//   inactiveRemark?: string;
// }

// interface AuthContextType {
//   user: UserData | null;
//   loading: boolean;
//   error: string | null;
//   logout: () => void;
//   refreshUser: () => Promise<void>;
//   login: (email: string, password: string, role: UserRole) => Promise<void>;
//   signup: (userData: {
//     name: string;
//     email: string;
//     password: string;
//     role: UserRole;
//     department: string;
//     studentId?: string;
//   }) => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Updated dummy user data with isActive field
// const dummyUsers: Record<string, UserData> = {
//   'student@test.com': {
//     id: '1',
//     name: 'Alex Johnson',
//     email: 'student@test.com',
//     role: 'student',
//     department: 'Computer Science',
//     memberSince: 'September 2023',
//     studentId: 'CS2023001',
//     isActive: true
//   },
//   'librarian@test.com': {
//     id: '2',
//     name: 'Sarah Wilson',
//     email: 'librarian@test.com',
//     role: 'librarian',
//     department: 'Library Services',
//     memberSince: 'January 2020',
//     isActive: true
//   },
//   'admin@test.com': {
//     id: '3',
//     name: 'Michael Brown',
//     email: 'admin@test.com',
//     role: 'admin',
//     department: 'Administration',
//     memberSince: 'March 2019',
//     isActive: true
//   },
//   'faculty@test.com': {
//     id: '4',
//     name: 'Dr. Emily Davis',
//     email: 'faculty@test.com',
//     role: 'faculty',
//     department: 'Mathematics',
//     memberSince: 'August 2018',
//     isActive: true
//   },
//   'guest@test.com': {
//     id: '5',
//     name: 'John Visitor',
//     email: 'guest@test.com',
//     role: 'guest',
//     department: 'Guest Access',
//     memberSince: 'December 2024',
//     isActive: true
//   }
// };

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<UserData | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const loadUser = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const savedUser = localStorage.getItem('currentUser');
//       if (savedUser) {
//         const userData = JSON.parse(savedUser);
//         // Check if user is active
//         if (!userData.isActive) {
//           setError('Your account has been deactivated. Please contact administration.');
//           setUser(null);
//           localStorage.removeItem('currentUser');
//         } else {
//           setUser(userData);
//         }
//       }
//     } catch (err) {
//       console.error('Failed to load user data', err);
//       setError('Failed to load user profile. Please try again later.');
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email: string, password: string, role: UserRole) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const dummyUser = dummyUsers[email];
//       if (dummyUser && password === 'password123' && dummyUser.role === role) {
//         if (!dummyUser.isActive) {
//           throw new Error('Your account has been deactivated. Please contact administration.');
//         }
//         setUser(dummyUser);
//         localStorage.setItem('currentUser', JSON.stringify(dummyUser));
//       } else {
//         throw new Error('Invalid credentials');
//       }
//     } catch (err) {
//       console.error('Login failed', err);
//       setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const signup = async (userData: {
//     name: string;
//     email: string;
//     password: string;
//     role: UserRole;
//     department: string;
//     studentId?: string;
//   }) => {
//     setLoading(true);
//     setError(null);
//     try {
//       // Check if user already exists
//       if (dummyUsers[userData.email]) {
//         throw new Error('User with this email already exists');
//       }

//       // Don't allow admin signup
//       if (userData.role === 'admin') {
//         throw new Error('Admin accounts cannot be created through signup');
//       }

//       const newUser: UserData = {
//         id: (Object.keys(dummyUsers).length + 1).toString(),
//         name: userData.name,
//         email: userData.email,
//         role: userData.role,
//         department: userData.department,
//         memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
//         studentId: userData.studentId,
//         isActive: true
//       };

//       // Add to dummy users
//       dummyUsers[userData.email] = newUser;
      
//       setUser(newUser);
//       localStorage.setItem('currentUser', JSON.stringify(newUser));
//     } catch (err) {
//       console.error('Signup failed', err);
//       setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const refreshUser = async () => {
//     await loadUser();
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('currentUser');
//   };

//   useEffect(() => {
//     loadUser();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, loading, error, logout, refreshUser, login, signup }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   // const context = useContext(AuthContext);
//   // if (context === undefined) {
//   //   throw new Error('useAuth must be used within an AuthProvider');
//   // }

//   const user= localStorage.getItem("user");
//   if(!user){
//     throw new Error('useAuth must be used within an AuthProvider');
//   }

//   return user;
// };
