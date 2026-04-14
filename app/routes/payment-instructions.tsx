import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button/button";
import { ArrowLeft, Copy, Check, CreditCard, Building2, Smartphone } from "lucide-react";
import styles from "./payment-instructions.module.css";

type BankOption = {
  id: string;
  name: string;
  accountNumber: string;
  accountHolder: string;
  icon: React.ReactNode;
};

export default function PaymentInstructions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enrollmentId = searchParams.get('enrollment_id') || '';
  const amount = searchParams.get('amount') || '0';
  const [copiedField, setCopiedField] = useState("");
  const [selectedBank, setSelectedBank] = useState("cbe");

  const bankOptions: BankOption[] = [
    { id: "cbe", name: "Commercial Bank of Ethiopia", accountNumber: "1000610828276", accountHolder: "Asmamaw Abebaw", icon: <Building2 size={24} /> },
    { id: "boa", name: "Bank of Abyssinia", accountNumber: "163240955", accountHolder: "Asmamaw Abebaw", icon: <Building2 size={24} /> },
    { id: "telebirr", name: "Telebirr", accountNumber: "0918472699", accountHolder: "Wubamlak", icon: <Smartphone size={24} /> },
  ];

  const selectedBankDetails = bankOptions.find(b => b.id === selectedBank) || bankOptions[0];

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleDone = () => {
    navigate(`/payment-proof?enrollment_id=${enrollmentId}&amount=${amount}`);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>

        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.icon}><CreditCard size={40} /></div>
            <h1 className={styles.title}>Payment Instructions</h1>
            <p className={styles.subtitle}>Transfer the amount to the following bank account</p>
          </div>

          <div className={styles.amountCard}>
            <div className={styles.amountLabel}>Amount to Pay</div>
            <div className={styles.amountValue}>{Number(amount).toLocaleString()} ETB</div>
          </div>

          <div className={styles.bankSelection}>
            <h2 className={styles.sectionTitle}>Select Payment Method</h2>
            <div className={styles.bankButtons}>
              {bankOptions.map(bank => (
                <button key={bank.id} type="button" onClick={() => setSelectedBank(bank.id)} className={`${styles.bankButton} ${selectedBank === bank.id ? styles.bankButtonActive : ''}`}>
                  {bank.icon}
                  <span>{bank.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.bankCard}>
            <h2 className={styles.bankCardTitle}>Account Details - {selectedBankDetails.name}</h2>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Account Number</span>
              <div className={styles.detailValue}>
                <span className={styles.accountNumber}>{selectedBankDetails.accountNumber}</span>
                <button type="button" onClick={() => copyToClipboard(selectedBankDetails.accountNumber, "account")} className={styles.copyButton}>
                  {copiedField === "account" ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Account Holder</span>
              <div className={styles.detailValue}>
                <span>{selectedBankDetails.accountHolder}</span>
                <button type="button" onClick={() => copyToClipboard(selectedBankDetails.accountHolder, "holder")} className={styles.copyButton}>
                  {copiedField === "holder" ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.instructions}>
            <h3 className={styles.instructionsTitle}>Steps to Complete Payment:</h3>
            <ol className={styles.instructionsList}>
              <li>Copy the bank details above</li>
              <li>Transfer {Number(amount).toLocaleString()} ETB to the account</li>
              <li>Take a screenshot of the successful transaction</li>
              <li>Click "Done" below to submit your payment proof</li>
            </ol>
          </div>

          <Button size="lg" className={styles.doneButton} onClick={handleDone}>
            Done - Submit Payment Proof
          </Button>
        </div>
      </main>
    </div>
  );
}
