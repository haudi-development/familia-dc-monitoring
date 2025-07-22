'use client'

import { useState } from 'react'
import { Plus, Bell, AlertTriangle, CheckCircle, Edit2, Trash2, Clock, CheckCircle2, AlertCircle, Filter, Settings } from 'lucide-react'
import { AlertRule, AlertCondition, AlertAction, AlertHistory, AlertSeverity, AlertStatus } from '@/lib/types'
import { AlertRuleModal } from '@/components/dashboard/AlertRuleModal'
import { DATA_CENTERS, ROOMS } from '@/lib/constants'
import { formatMetricValue } from '@/lib/utils'

type TabType = 'rules' | 'history'

// Mock alert history data
const mockAlertHistory: AlertHistory[] = [
  {
    id: 'ah-1',
    ruleId: '1',
    ruleName: '高温警告',
    severity: 'high',
    status: 'active',
    triggeredAt: new Date('2025-01-22T10:30:00'),
    resolvedAt: null,
    acknowledgedAt: null,
    acknowledgedBy: null,
    sensorId: 'SEN-001-G5-E',
    rackId: 'RACK-001-G5',
    roomId: 'ROOM-001',
    dcId: 'DC-001',
    metricType: 'temperature',
    actualValue: 32.5,
    thresholdValue: 30,
    message: 'ラック RACK-001-G5 の排気側温度が32.5°Cに達しました'
  },
  {
    id: 'ah-2',
    ruleId: '2',
    ruleName: '湿度異常',
    severity: 'medium',
    status: 'acknowledged',
    triggeredAt: new Date('2025-01-22T09:15:00'),
    resolvedAt: null,
    acknowledgedAt: new Date('2025-01-22T09:20:00'),
    acknowledgedBy: 'admin@example.com',
    sensorId: 'SEN-001-A1-I',
    rackId: 'RACK-001-A1',
    roomId: 'ROOM-001',
    dcId: 'DC-001',
    metricType: 'humidity',
    actualValue: 68.2,
    thresholdValue: 65,
    message: 'ルーム ROOM-001 の湿度が68.2%に達しました'
  },
  {
    id: 'ah-3',
    ruleId: '1',
    ruleName: '高温警告',
    severity: 'critical',
    status: 'resolved',
    triggeredAt: new Date('2025-01-22T08:00:00'),
    resolvedAt: new Date('2025-01-22T08:45:00'),
    acknowledgedAt: new Date('2025-01-22T08:05:00'),
    acknowledgedBy: 'admin@example.com',
    sensorId: 'SEN-002-P10-E',
    rackId: 'RACK-002-P10',
    roomId: 'ROOM-002',
    dcId: 'DC-001',
    metricType: 'temperature',
    actualValue: 35.8,
    thresholdValue: 30,
    message: 'ラック RACK-002-P10 の排気側温度が35.8°Cに達しました'
  },
  {
    id: 'ah-4',
    ruleId: '3',
    ruleName: '風量低下',
    severity: 'low',
    status: 'active',
    triggeredAt: new Date('2025-01-22T07:30:00'),
    resolvedAt: null,
    acknowledgedAt: null,
    acknowledgedBy: null,
    sensorId: 'SEN-001-M7-I',
    rackId: 'RACK-001-M7',
    roomId: 'ROOM-001',
    dcId: 'DC-001',
    metricType: 'airflow',
    actualValue: 85,
    thresholdValue: 90,
    message: 'ラック RACK-001-M7 の吸気側風量が85 CFMに低下しました'
  },
  {
    id: 'ah-5',
    ruleId: '1',
    ruleName: '高温警告',
    severity: 'high',
    status: 'resolved',
    triggeredAt: new Date('2025-01-21T14:20:00'),
    resolvedAt: new Date('2025-01-21T15:10:00'),
    acknowledgedAt: null,
    acknowledgedBy: null,
    sensorId: 'SEN-003-C3-E',
    rackId: 'RACK-003-C3',
    roomId: 'ROOM-003',
    dcId: 'DC-001',
    metricType: 'temperature',
    actualValue: 31.2,
    thresholdValue: 30,
    message: 'ラック RACK-003-C3 の排気側温度が31.2°Cに達しました'
  }
]

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
  const [activeTab, setActiveTab] = useState<TabType>('rules')
  const [alertRules, setAlertRules] = useState<AlertRule[]>(mockAlertRules)
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>(mockAlertHistory)
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus | 'all'>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all')
  
  const activeAlerts = alertHistory.filter(alert => alert.status === 'active').length

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

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlertHistory(alertHistory.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'acknowledged' as AlertStatus, acknowledgedAt: new Date(), acknowledgedBy: 'admin@example.com' }
        : alert
    ))
  }

  const handleResolveAlert = (alertId: string) => {
    setAlertHistory(alertHistory.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'resolved' as AlertStatus, resolvedAt: new Date() }
        : alert
    ))
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-blue-600 bg-blue-100'
    }
  }

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case 'active': return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'acknowledged': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'resolved': return <CheckCircle2 className="h-5 w-5 text-green-600" />
    }
  }

  // Filter alert history
  const filteredAlertHistory = alertHistory.filter(alert => {
    if (selectedStatus !== 'all' && alert.status !== selectedStatus) return false
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">アラート管理</h1>
          <p className="text-gray-600 mt-1">センサーデータに基づく自動アラートの設定と履歴</p>
        </div>
        {activeTab === 'rules' && (
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
        )}
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'rules'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>アラートルール</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'history'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>アラート履歴</span>
              {activeAlerts > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {activeAlerts}
                </span>
              )}
            </div>
          </button>
        </nav>
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

      {activeTab === 'rules' ? (
        <>
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
        </>
      ) : (
        /* Alert history */
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">フィルター:</span>
              </div>
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as AlertStatus | 'all')}
                  className="text-sm px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="all">すべてのステータス</option>
                  <option value="active">アクティブ</option>
                  <option value="acknowledged">確認済み</option>
                  <option value="resolved">解決済み</option>
                </select>
              </div>
              <div>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value as AlertSeverity | 'all')}
                  className="text-sm px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="all">すべての重要度</option>
                  <option value="critical">重大</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
            </div>
          </div>

          {/* Alert history list */}
          <div className="space-y-4">
            {filteredAlertHistory.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-12 text-center text-gray-500">
                アラート履歴がありません
              </div>
            ) : (
              filteredAlertHistory.map(alert => (
                <div
                  key={alert.id}
                  className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(alert.status)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-medium text-gray-900">{alert.ruleName}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                              {alert.severity === 'critical' ? '重大' :
                               alert.severity === 'high' ? '高' :
                               alert.severity === 'medium' ? '中' : '低'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{alert.message}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">場所:</span>
                              <p className="font-medium">{DATA_CENTERS[alert.dcId]?.name} / {ROOMS[alert.roomId]?.name}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">ラック:</span>
                              <p className="font-medium">{alert.rackId}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">測定値:</span>
                              <p className="font-medium text-red-600">
                                {formatMetricValue(alert.actualValue, alert.metricType)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">閾値:</span>
                              <p className="font-medium">
                                {formatMetricValue(alert.thresholdValue, alert.metricType)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                            <span>発生: {alert.triggeredAt.toLocaleString('ja-JP')}</span>
                            {alert.acknowledgedAt && (
                              <span>確認: {alert.acknowledgedAt.toLocaleString('ja-JP')} ({alert.acknowledgedBy})</span>
                            )}
                            {alert.resolvedAt && (
                              <span>解決: {alert.resolvedAt.toLocaleString('ja-JP')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {alert.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                          >
                            確認
                          </button>
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          >
                            解決
                          </button>
                        </>
                      )}
                      {alert.status === 'acknowledged' && (
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          解決
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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