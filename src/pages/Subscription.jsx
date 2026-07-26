import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PaystackButton } from 'react-paystack'; // <-- NEW IMPORT
import { LockOpen, Shield, ArrowLeft, Loader2 } from 'lucide-react';

export default function Subscription() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);

  const purchaseType = location.state?.type || 'credits'; 
  const topicId = location.state?.topicId;
  const title = location.state?.title || 'Mock Exam Credits (Pack of 3)';
  const price = location.state?.price || 1000;

  // --- NEW: PAYSTACK CONFIGURATION ---
  const paystackConfig = {
    reference: (new Date()).getTime().toString(), // Generates a unique transaction ID
    email: currentUser?.email || "student@example.com",
    amount: price * 100, // Paystack requires the amount in Kobo! (Naira * 100)
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  };

// What happens when the user successfully pays
  const handlePaystackSuccessAction = async (referenceObj) => {
    setIsProcessing(true);
    
    try {
      // 1. Grab the reference number Paystack just gave us
      const referenceId = referenceObj.reference;
      
      // 2. Send it to our backend Vault to be verified
      const response = await fetch('http://localhost:5000/api/users/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: referenceId,
          firebaseUid: currentUser.uid,
          topicId: topicId
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Payment Verified! Topic unlocked. Redirecting to study...');
        window.location.href = `/study/${topicId}`; // Force reload to update user context
      } else {
        alert(`Verification failed: ${data.error}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert('An error occurred while verifying your payment. Please contact support.');
      setIsProcessing(false);
    }
  };

  // What happens if they close the window without paying
  const handlePaystackCloseAction = () => {
    console.log("User closed the payment window.");
  };

  const paystackComponentProps = {
    ...paystackConfig,
    text: `Pay ₦${price} with Paystack`,
    onSuccess: (reference) => handlePaystackSuccessAction(reference),
    onClose: handlePaystackCloseAction,
  };
  // ------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-medium transition-colors"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="bg-gray-900 p-8 text-center">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {purchaseType === 'topic' ? <LockOpen size={32} /> : <Shield size={32} />}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Complete Purchase</h1>
            <p className="text-gray-400">Unlock 30 days of full access</p>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
              <span className="text-gray-600 font-medium">{title}</span>
              <span className="text-2xl font-black text-gray-900">₦{price}</span>
            </div>

            {/* NEW: Real Paystack Button */}
            <PaystackButton 
              {...paystackComponentProps}
              className="w-full py-4 rounded-xl font-bold text-lg text-white bg-green-600 hover:bg-green-700 shadow-md transition-all mb-4"
            />

            {/* Developer Cheat Button (We can remove this later) */}
                       
          </div>
        </div>
      </div>
    </div>
  );
}