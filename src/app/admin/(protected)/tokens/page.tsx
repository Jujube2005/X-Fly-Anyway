"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/States";

interface Token {
  id: string;
  name: string;
  scopes: string[];
  expires_at: string;
  is_revoked: boolean;
  created_at: string;
}

export default function AdminTokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    scopes: ["read:manifest"]
  });
  
  // One-time display state
  const [newTokens, setNewTokens] = useState<{access: string; refresh: string} | null>(null);

  const fetchTokens = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tokens");
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Forbidden: Only Super Admins can manage external API tokens.");
        }
        throw new Error(json.error || "Failed to fetch tokens");
      }
      setTokens(json.tokens || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      name: "",
      scopes: ["read:manifest"]
    });
    setNewTokens(null);
    setIsModalOpen(true);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this token? This action cannot be undone and external systems will immediately lose access.")) return;
    try {
      const res = await fetch(`/api/admin/tokens/${id}/revoke`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to revoke token");
      fetchTokens();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate token");
      
      setNewTokens({
        access: json.rawAccessToken,
        refresh: json.rawRefreshToken
      });
      
      fetchTokens();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (error && error.includes("Forbidden")) {
    return (
      <div className="flex flex-col gap-6 py-2 pb-12">
        <div className="p-6 bg-red-50 text-red-700 rounded-3xl border border-red-100 font-semibold flex items-center gap-3">
          <span className="text-2xl">⛔</span> 
          <div>
            <h2 className="text-lg">Access Denied</h2>
            <p className="text-sm text-red-600 font-medium">Only Super Admins can manage External API Tokens.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-2 pb-12">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-[#f3f4f6]">
        <div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">API Tokens</h1>
          <p className="text-sm text-[#6b7280] font-medium mt-1">Manage external system access</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="bg-[#111827] text-white px-6 py-2 rounded-xl font-bold hover:bg-black transition-colors"
        >
          + Generate Token
        </button>
      </div>

      {isLoading && <div className="mt-12"><LoadingState message="Loading tokens..." /></div>}
      
      {error && !error.includes("Forbidden") && (
        <div className="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 text-sm font-semibold flex items-center gap-3">
          <span className="text-xl">⚠️</span> {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="bg-white rounded-3xl shadow-sm border border-[#f3f4f6] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f9fafb] text-[#6b7280] font-semibold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Scopes</th>
                  <th className="px-6 py-4">Expires At</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4f6]">
                {tokens.map((t) => {
                  const isExpired = new Date(t.expires_at) < new Date();
                  const isRevoked = t.is_revoked;
                  const status = isRevoked ? "revoked" : (isExpired ? "expired" : "active");
                  
                  return (
                    <tr key={t.id} className="hover:bg-[#f9fafb] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#111827]">{t.name}</td>
                      <td className="px-6 py-4 text-[#6b7280]">{t.scopes.join(", ")}</td>
                      <td className="px-6 py-4 text-[#6b7280]">
                        {new Date(t.expires_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isRevoked && !isExpired && (
                          <button 
                            onClick={() => handleRevoke(t.id)}
                            className="text-sm font-bold text-red-600 hover:underline"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {tokens.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#9ca3af] font-medium">
                      No API tokens found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            {newTokens ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-sm font-bold">Copy these tokens now. You will not be able to see them again after closing this window.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#374151] mb-2">Access Token (Expires in 1 hour)</label>
                  <div className="flex gap-2">
                    <input readOnly type="text" value={newTokens.access} className="w-full px-4 py-3 bg-[#f9fafb] border border-[#d1d5db] rounded-xl font-mono text-sm text-[#111827]" />
                    <button onClick={() => handleCopy(newTokens.access)} className="px-4 py-2 bg-[#f5c800] text-[#111827] rounded-xl font-bold hover:bg-[#e0b600]">Copy</button>
                  </div>
                </div>

                <div className="mt-2">
                  <label className="block text-sm font-bold text-[#374151] mb-2">Refresh Token</label>
                  <div className="flex gap-2">
                    <input readOnly type="text" value={newTokens.refresh} className="w-full px-4 py-3 bg-[#f9fafb] border border-[#d1d5db] rounded-xl font-mono text-sm text-[#111827]" />
                    <button onClick={() => handleCopy(newTokens.refresh)} className="px-4 py-2 bg-[#f5c800] text-[#111827] rounded-xl font-bold hover:bg-[#e0b600]">Copy</button>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold bg-[#111827] text-white hover:bg-black w-full">I have copied my tokens safely</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-[#111827] mb-6">Generate API Token</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-2">System Name (e.g. Baggage Handling)</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-[#f9fafb] border border-[#d1d5db] rounded-xl focus:outline-none focus:border-[#f5c800]" placeholder="Enter external system name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-2">Scopes</label>
                    <div className="p-4 bg-[#f9fafb] border border-[#d1d5db] rounded-xl flex items-center gap-3">
                      <input type="checkbox" checked readOnly className="w-4 h-4 text-[#111827] rounded border-gray-300 focus:ring-black" />
                      <span className="text-sm font-medium text-[#111827]">read:manifest</span>
                      <span className="text-xs text-[#6b7280] ml-auto">(Required)</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 rounded-xl text-sm font-bold text-[#6b7280] hover:bg-[#f3f4f6]">Cancel</button>
                    <button type="submit" className="px-5 py-3 rounded-xl text-sm font-bold bg-[#111827] text-white hover:bg-black">Generate</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
