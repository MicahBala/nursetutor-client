import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LockOpen, Shield, ArrowLeft } from 'lucide-react';

export default function Subscription() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const purchaseType = location.state?.type || 'credits'; 
  const topicId = location.state?.topicId;
  const title = location.state?.title || 'Mock Exam Credits (Pack of 3)';
  const price = location.state?.price || 1000;

  // 1. Load the Quickteller/Interswitch Script when the component mounts
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://newwebpay.interswitchng.com/inline-checkout.js'; // LIVE URL
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 2. The callback function when the Quickteller popup closes
  const paymentCallback = async (response) => {
    console.log("Quickteller Response:", response);
    
    // Quickteller returns response.resp === '00' or response.ResponseCode === '00' for success
    if (response && (response.resp === '00' || response.ResponseCode === '00' || response.desc === 'Approved by Financial Institution')) {
      setIsProcessing(true);
      try {
        const token = await currentUser.getIdToken();
        
        // Send the reference AND amount to backend for verification
        const verifyRes = await fetch('http://localhost:5000/api/users/verify-payment', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({
            reference: response.txnref || response.txn_ref,
            amount: price * 100, // Quickteller uses Kobo/minor units
            firebaseUid: currentUser.uid,
            topicId: topicId
          })
        });

        const data = await verifyRes.json();

        if (verifyRes.ok) {
          alert('Payment Verified! Topic unlocked. Redirecting to study...');
          window.location.href = `/study/${topicId}`; 
        } else {
          alert(`Verification failed: ${data.error}`);
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("Error confirming payment:", error);
        alert('An error occurred while verifying your payment. Please contact support.');
        setIsProcessing(false);
      }
    } else {
      console.log("Payment was not completed successfully.");
      setIsProcessing(false);
    }
  };

  // 3. Trigger the Quickteller Popup
const handleQuicktellerPayment = () => {
    if (!scriptLoaded || !window.webpayCheckout) {
      alert("Payment gateway is still loading. Please try again in a moment.");
      return;
    }

    const transactionRef = "NURSE_" + new Date().getTime().toString();
    
    // Get the current page URL to give to Quickteller
    const currentUrl = window.location.href;

    // Call the injected Interswitch function
    window.webpayCheckout({
      merchant_code: import.meta.env.VITE_QUICKTELLER_MERCHANT_CODE, 
      pay_item_id: import.meta.env.VITE_QUICKTELLER_PAY_ITEM_ID,     
      txn_ref: transactionRef,
      amount: price * 100, 
      currency: 566,       
      cust_email: currentUser?.email || "student@example.com",
      cust_id: currentUser?.uid || "student_123", // Good practice to include
      site_redirect_url: currentUrl,              // <-- THE FIX IS HERE
      onComplete: paymentCallback,
      mode: "LIVE"         
    });
  };
  
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

            <button 
              onClick={handleQuicktellerPayment}
              disabled={isProcessing || !scriptLoaded}
              className="w-full py-4 rounded-xl font-bold text-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Verifying...' : `Pay ₦${price} with Quickteller`}
            </button>
                       
          </div>
        </div>
      </div>
    </div>
  );
}