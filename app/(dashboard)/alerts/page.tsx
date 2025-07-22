'use client'

import { useState } from 'react'
import { Plus, Bell, AlertTriangle, CheckCircle, X, Edit2, Trash2 } from 'lucide-react'
import { AlertRule, AlertCondition, AlertAction } from '@/lib/types'
import { AlertRuleModal } from '@/components/dashboard/AlertRuleModal'

// Mock data for demonstration
const mockAlertRules: AlertRule[] = [
  {
    id: '1',
    name: '高温警告',
    description: 'ラックの温度が30°Cを超えた場合に通知',
    enabled: true,
    conditions: [
      {
        type: 'temperature',
        operator: '>',
        value: 30,
        target: 'any'
      }
    ],
    actions: [
      {
        type: 'email',
        config: {
          to: 'admin@example.com',
          subject: '温度警告'
        }
      }
    ],
    createdAt: new Date('2025-01-15'),
    lastTriggered: new Date('2025-01-20'),
    triggerCount: 5
  },
  {
    id: '2',
    name: '湿度異常',
    description: '特定ルームの湿度が65%を超えた場合',
    enabled: true,
    conditions: [
      {
        type: 'humidity',
        operator: '>',
        value: 65,
        target: 'room',
        targetId: 'ROOM-001'
      }
    ],
    actions: [
      {
        type: 'webhook',
        config: {
          url: 'https://api.example.com/alerts',
          method: 'POST'
        }
      }
    ],
    createdAt: new Date('2025-01-10'),
    lastTriggered: null,
    triggerCount: 0
  }
]

export default function AlertsPage() {
  const [alertRules, setAlertRules] = useState<AlertRule[]>(mockAlertRules)
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null)
  const [activeAlerts, setActiveAlerts] = useState<number>(2)

  const handleToggleRule = (ruleId: string) => {
    setAlertRules(alertRules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ))
  }

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('このアラートルールを削除してもよろしいですか？')) {
      setAlertRules(alertRules.filter(rule => rule.id !== ruleId))
    }
  }

  const handleEditRule = (rule: AlertRule) => {
    setEditingRule(rule)
    setShowRuleModal(true)
  }

  const handleSaveRule = (rule: Omit<AlertRule, 'id' | 'createdAt' | 'lastTriggered' | 'triggerCount'>) => {
    if (editingRule) {
      // Update existing rule
      setAlertRules(alertRules.map(r => 
        r.id === editingRule.id 
          ? { ...r, ...rule }
          : r
      ))
    } else {
      // Add new rule
      const newRule: AlertRule = {
        ...rule,
        id: Date.now().toString(),
        createdAt: new Date(),
        lastTriggered: null,
        triggerCount: 0
      }
      setAlertRules([...alertRules, newRule])
    }
    setShowRuleModal(false)
    setEditingRule(null)
  }

  const getConditionText = (condition: AlertCondition) => {
    const metricName = condition.type === 'temperature' ? '温度' : 
                      condition.type === 'humidity' ? '湿度' : '風量'
    const operatorText = condition.operator === '>' ? 'より大きい' :
                        condition.operator === '<' ? 'より小さい' :
                        condition.operator === '=' ? 'と等しい' : ''
    const unit = condition.type === 'temperature' ? '°C' :
                condition.type === 'humidity' ? '%' : 'CFM'
    
    let targetText = ''
    if (condition.target === 'any') {
      targetText = 'いずれかのセンサー'
    } else if (condition.target === 'room') {
      targetText = `ルーム ${condition.targetId}`
    } else if (condition.target === 'rack') {
      targetText = `ラック ${condition.targetId}`
    }
    
    return `${targetText}の${metricName}が ${condition.value}${unit} ${operatorText}場合`
  }

  const getActionText = (action: AlertAction) => {
    if (action.type === 'email') {
      return `メール送信: ${action.config.to}`
    } else if (action.type === 'webhook') {
      return `Webhook: ${action.config.url}`
    } else if (action.type === 'slack') {
      return `Slack通知: ${action.config.channel}`
    }
    return ''
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">アラート管理</h1>
          <p className="text-gray-600 mt-1">センサーデータに基づく自動アラートの設定</p>
        </div>
        <button
          onClick={() => {
            setEditingRule(null)
            setShowRuleModal(true)
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>新規ルール作成</span>
        </button>
      </div>

      {/* Alert statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">アクティブアラート</p>
              <p className="text-2xl font-bold text-red-600">{activeAlerts}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">有効なルール</p>
              <p className="text-2xl font-bold text-gray-900">
                {alertRules.filter(r => r.enabled).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今日のトリガー数</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <Bell className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Alert rules */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">アラートルール</h2>
        <div className="space-y-4">
          {alertRules.map(rule => (
            <div
              key={rule.id}
              className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">{rule.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      rule.enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.enabled ? '有効' : '無効'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">条件: </span>
                      <span className="text-gray-600">
                        {rule.conditions.map((condition, index) => (
                          <span key={index}>
                            {index > 0 && ' かつ '}
                            {getConditionText(condition)}
                          </span>
                        ))}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">アクション: </span>
                      <span className="text-gray-600">
                        {rule.actions.map((action, index) => (
                          <span key={index}>
                            {index > 0 && ', '}
                            {getActionText(action)}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
                    <span>作成日: {rule.createdAt.toLocaleDateString('ja-JP')}</span>
                    {rule.lastTriggered && (
                      <span>最終トリガー: {rule.lastTriggered.toLocaleDateString('ja-JP')}</span>
                    )}
                    <span>トリガー回数: {rule.triggerCount}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleToggleRule(rule.id)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      rule.enabled
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
                    }`}
                  >
                    {rule.enabled ? '無効化' : '有効化'}
                  </button>
                  <button
                    onClick={() => handleEditRule(rule)}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rule modal */}
      {showRuleModal && (
        <AlertRuleModal
          rule={editingRule}
          isOpen={showRuleModal}
          onClose={() => {
            setShowRuleModal(false)
            setEditingRule(null)
          }}
          onSave={handleSaveRule}
        />
      )}
    </div>
  )
}