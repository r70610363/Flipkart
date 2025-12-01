
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, User as UserIcon, LogOut, ChevronDown, Plus, ShoppingBag, Sparkles, ShieldCheck, Gift, Store, Megaphone, HelpCircle, Briefcase, Loader2, MessageSquare, Bell, Mail, CheckCheck, Heart, Eye, EyeOff } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { auth } from '../services/firebase'; // <-- Import Firebase auth
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification,
    onAuthStateChanged,
    signOut
} from "firebase/auth";

// --- Mock Services (Keep them for now, but phase out) ---
import { checkUserExists, registerUser, authenticateUser } from '../services/data';
import { sendOtp, verifyOtp } from '../services/otpService';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, cart, login, logout, filters, setFilters, isLoginModalOpen, openLoginModal, closeLoginModal, wishlist, notifications, addNotification, markAllNotificationsRead } = useShop();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // --- NEW Firebase Auth State ---
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  
  // --- Mobile Verification State (for Signup) ---
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input' | 'mobile_otp' | 'email_verify_sent'>('input');
  
  // --- UI/UX State ---
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => n.unread).length;

  const navigate = useNavigate();

    // *** IMPORTANT: Listen for Firebase auth state changes ***
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in.
                // Here, you would typically fetch your own backend's user profile.
                // For now, we'll create a mock user object.
                const userProfile = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || signupName || 'User', // Get display name if available
                    email: firebaseUser.email!,
                    mobile: firebaseUser.phoneNumber || mobile,
                    role: 'customer'
                };
                login(userProfile); // Update context
                
                // If email is not verified, show message
                if (!firebaseUser.emailVerified && step !== 'email_verify_sent') {
                   setSuccessMsg("Welcome! Please check your email to verify your account.");
                }

            } else {
                // User is signed out.
                logout();
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, category: null }));
    navigate('/shop');
  };

  const resetAuthForms = () => {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSignupName('');
      setMobile('');
      setOtp('');
      setError('');
      setSuccessMsg('');
      setIsLoading(false);
      setStep('input');
  };

  const handleLogout = async () => {
    await signOut(auth);
    logout(); // This will clear user from context
    navigate('/');
  };
  
  // --- NEW Firebase Auth Submit Handler ---
  const handleAuthSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccessMsg('');
      setIsLoading(true);

      if (authMode === 'login') {
        // --- LOGIN WITH FIREBASE ---
        if (!email || !password) {
            setError("Please enter both email and password.");
            setIsLoading(false);
            return;
        }
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (!userCredential.user.emailVerified) {
                setError("Email not verified. Please check your inbox or sign up again to get a new verification link.");
                await signOut(auth); // Log them out
                setIsLoading(false);
                return;
            }
            // onAuthStateChanged will handle the rest
            closeLoginModal();

        } catch (error: any) {
            setError(error.message.includes('auth/invalid-credential') 
                ? "Invalid email or password."
                : "Login failed. Please try again.");
            console.error("Firebase Login Error:", error);
        }

      } else {
        // --- SIGNUP WITH FIREBASE (Multi-step) ---
        if (step === 'input') {
            // Step 1: Validate form and send mobile OTP
            if (!signupName.trim()) { setError("Name is required"); setIsLoading(false); return; }
            if (!/^[6-9]\d{9}$/.test(mobile)) { setError("Invalid Mobile Number"); setIsLoading(false); return; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Invalid Email Address"); setIsLoading(false); return; }
            if (password.length < 6) { setError("Password must be at least 6 characters"); setIsLoading(false); return; }
            if (password !== confirmPassword) { setError("Passwords do not match"); setIsLoading(false); return; }
            
            try {
                // MOCK sending OTP
                const response = await sendOtp(mobile);
                if (response.success) {
                    setSuccessMsg(`OTP sent to ${mobile}. Auto-verifying...`);
                    // MOCK auto-verification
                    setTimeout(() => {
                        const devCode = response.devCode || '1234';
                        setOtp(devCode);
                        handleAuthSubmit(e); // Re-trigger to go to next step
                    }, 2000);
                    setStep('mobile_otp');
                } else {
                    setError(response.message);
                    setIsLoading(false);
                }
            } catch(err) {
                setError("Failed to send OTP. Try again.");
                setIsLoading(false);
            }

        } else if (step === 'mobile_otp') {
            // Step 2: Verify mobile OTP and create Firebase user
            try {
                // MOCK OTP verification
                const verifyResponse = await verifyOtp(mobile, otp);
                if (verifyResponse.success) {
                    setSuccessMsg("Mobile verified! Creating account...");
                    
                    // Create user in Firebase
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    
                    // Send email verification
                    await sendEmailVerification(userCredential.user);

                    setSuccessMsg("Account created! A verification link has been sent to your email.");
                    setStep('email_verify_sent'); // Move to final step
                    
                    // Don't close modal, let user see the message.
                    // You can add a button to close it.
                } else {
                    setError("Invalid OTP. Please try again.");
                    setStep('input'); // Go back to input
                }
            } catch (error: any) {
                setError(error.message.includes('auth/email-already-in-use')
                    ? "An account already exists with this email."
                    : "Signup failed. Please try again.");
                console.error("Firebase Signup Error:", error);
                setStep('input');
            }
        }
      }
      setIsLoading(false);
  };
  
  const toggleAuthMode = () => {
      setAuthMode(prev => prev === 'login' ? 'signup' : 'login');
      resetAuthForms();
  };

  useEffect(() => {
      if(isLoginModalOpen) {
          resetAuthForms();
      }
  }, [isLoginModalOpen]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-[#f1f3f6]">
      <header className="sticky top-0 z-50 bg-[#2874f0] shadow-md md:h-[64px]">
        {/* Header content remains largely the same... */}
        {/* ...but we'll adjust the user dropdown and logout button */}
          <div className="container mx-auto px-3 md:px-4 h-auto md:h-full flex flex-col md:flex-row items-center gap-2 md:gap-8 max-w-[1200px] relative py-2 md:py-0">
          <div className="flex items-center justify-between w-full md:w-auto h-[56px] md:h-auto">
            <div className="flex items-center gap-3">
              <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X /> : <Menu />}</button>
              <Link to="/" className="text-white font-bold text-lg md:text-xl">Flipkart</Link>
            </div>
          </div>
          <div className="hidden md:flex flex-1 max-w-[560px] relative">
            <input type="text" placeholder="Search..." className="w-full pl-4 pr-10 py-2 rounded-sm" />
            <button type="submit" className="absolute right-0 top-0 bottom-0 px-3 text-[#2874f0]"><Search/></button>
          </div>
          <div className="hidden md:flex items-center gap-6 text-white font-medium">
            {user ? (
               <div className="group relative cursor-pointer flex items-center gap-1">
                 <span>Hi, {user.name}</span>
                 <ChevronDown className="w-4 h-4" />
                 <div className="absolute top-full right-0 pt-2 w-48 hidden group-hover:block">
                   <div className="bg-white text-black shadow-lg rounded">
                      <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">My Profile</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
                   </div>
                 </div>
               </div>
            ) : (
              <button onClick={openLoginModal} className="bg-white text-[#2874f0] px-8 py-1 font-bold rounded-sm">Login</button>
            )}
            <Link to="/cart" className="flex items-center gap-2">
              <ShoppingCart/>
              <span>Cart</span>
              {totalItems > 0 && <span className="bg-red-500 text-white rounded-full px-2">{totalItems}</span>}
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-grow w-full mx-auto pb-6">{children}</main>

      {/* --- UPDATED AUTH MODAL --- */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-3xl flex overflow-hidden">
            
            <div className="hidden md:flex w-[40%] bg-[#2874f0] p-8 flex-col text-white">
              <h2 className="text-2xl font-semibold mb-4">
                  {authMode === 'login' ? 'Login' : 'Looks like you're new!'}
              </h2>
              <p className="text-base">
                  {authMode === 'login' 
                    ? 'Get access to your Orders, Wishlist and Recommendations' 
                    : 'Sign up with your details to get started'}
              </p>
            </div>

            <div className="flex-1 p-8 relative">
               <button onClick={closeLoginModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X /></button>
               <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {error && <div className="text-red-500 bg-red-100 p-3 rounded text-sm">{error}</div>}
                  {successMsg && <div className="text-green-600 bg-green-100 p-3 rounded text-sm">{successMsg}</div>}
                  
                  {step === 'email_verify_sent' ? (
                     <div className='text-center p-4'>
                        <Mail className="mx-auto w-12 h-12 text-green-500"/>
                        <h3 className='font-bold text-lg mt-2'>Verification Email Sent!</h3>
                        <p className='text-slate-600 text-sm'>Please check your inbox at <strong>{email}</strong> and click the link to finish signing up.</p>
                        <button onClick={closeLoginModal} className="mt-4 w-full bg-[#fb641b] text-white font-bold py-2">Close</button>
                     </div>
                  ) : (
                    <>
                      {authMode === 'signup' && step === 'input' && (
                          <input type="text" placeholder="Name" value={signupName} onChange={e => setSignupName(e.target.value)} required className="w-full p-2 border-b" />
                      )}

                      <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border-b" />

                      {authMode === 'signup' && step === 'input' && (
                          <input type="tel" placeholder="Mobile Number (for OTP)" value={mobile} onChange={e => setMobile(e.target.value)} required className="w-full p-2 border-b" />
                      )}

                      {(step === 'input' || authMode === 'login') && (
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 border-b" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 text-gray-500">
                              {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                          </button>
                        </div>
                      )}
                      
                      {authMode === 'signup' && step === 'input' && (
                         <div className="relative">
                            <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full p-2 border-b" />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-2 text-gray-500">
                                {showConfirmPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                            </button>
                         </div>
                      )}

                      {authMode === 'signup' && step === 'mobile_otp' && (
                          <input type="text" placeholder="Enter 4-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={4} className="w-full p-2 border-b text-center tracking-widest" />
                      )}

                      <button type="submit" disabled={isLoading} className="w-full bg-[#fb641b] text-white font-bold py-3 disabled:opacity-50 flex items-center justify-center">
                        {isLoading ? <Loader2 className="animate-spin" /> : (authMode === 'login' ? 'Login' : (step === 'input' ? 'Continue' : 'Verify & Sign Up'))}
                      </button>

                      <p className="text-center text-sm">
                          <button type="button" onClick={toggleAuthMode} className="text-[#2874f0] font-semibold">
                              {authMode === 'login' ? 'New to Flipkart? Create an account' : 'Existing User? Log in'}
                          </button>
                      </p>
                    </>
                  )}
               </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
