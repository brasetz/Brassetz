import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';

interface TransactionFormProps {
  onSuccess: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    did: '',
    tokenName: '',
    transactionId: '',
    email: ''
  });

  const validateForm = () => {
    const { did, email, tokenName, transactionId } = formData;

    if (did.length !== 70 || !did.endsWith("0btz")) {
      toast.error("D-ID must be exactly 70 characters long and end with '0btz'");
      return false;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!tokenName || !transactionId) {
      toast.error("All fields are required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    const params = new URLSearchParams();
    Object.entries(formData).forEach(([key, value]) => {
      params.append(key === 'did' ? 'D-ID' : 
                   key === 'tokenName' ? 'Token Name' :
                   key === 'transactionId' ? 'Transaction id' : 
                   'Email', value);
    });

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbw7D-IXtfVQ22QtzUwzYD3JloKq_CSrUwg86XL2twoy5XcNrYMxgzoP6m7dA6ZGl0NAfA/exec",
        {
          method: "POST",
          body: params
        }
      );
      
      const data = await response.json();
      
      if (data.result === "success") {
        toast.success("Form submitted successfully! We'll update you via email soon.");
        setFormData({ did: '', tokenName: '', transactionId: '', email: '' });
        onSuccess();
      } else {
        toast.error(data.error || "Submission failed. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="did" className="block text-sm font-medium mb-1">D-ID:</label>
        <Input
          id="did"
          value={formData.did}
          onChange={(e) => setFormData(prev => ({ ...prev, did: e.target.value }))}
          placeholder="Enter your D-ID"
          className="font-mono"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">Must be 70 characters and end with 0btz</p>
      </div>

      <div>
        <label htmlFor="tokenName" className="block text-sm font-medium mb-1">Token Name:</label>
        <Input
          id="tokenName"
          value={formData.tokenName}
          onChange={(e) => setFormData(prev => ({ ...prev, tokenName: e.target.value }))}
          placeholder="Enter token name"
          required
        />
      </div>

      <div>
        <label htmlFor="transactionId" className="block text-sm font-medium mb-1">Transaction ID:</label>
        <Input
          id="transactionId"
          value={formData.transactionId}
          onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
          placeholder="Enter transaction ID"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email:</label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Enter your email"
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Transaction'
        )}
      </Button>
    </form>
  );
};