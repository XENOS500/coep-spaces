import BASE_URL from './api'

export const approvalService = {
  getPendingApprovals: async () => {
    const res = await fetch(`${BASE_URL}/approvals/pending`)
    return res.json()
  },
  updateApprovalStatus: async (id, status) => {
    const res = await fetch(`${BASE_URL}/approvals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    return res.json()
  }
}

