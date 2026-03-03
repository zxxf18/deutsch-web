import { BookOpen, Clock, Target, Lightbulb, Trophy, CheckCircle2 } from 'lucide-react'

export function Strategy() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 md:p-12 mb-10 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
            德国入籍考试攻略
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Einbürgerungstest 备考指南：了解考试规则，掌握备考策略，轻松通过入籍考试
          </p>
        </div>
      </div>

      {/* 简介卡片 */}
      <section className="mb-10">
        <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border-2 border-gray-100 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">德国入籍考试简介</h2>
            <p className="text-gray-600 leading-relaxed">
              德国入籍考试（Einbürgerungstest）是申请德国国籍时的必考项目，考试内容来自《居住法》规定的「生活 in Deutschland」题库。考试旨在考察申请人对德国法律、历史、文化及社会制度的了解程度。
            </p>
          </div>
        </div>
      </section>

      {/* 考试规则 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-500" />
          考试规则
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: BookOpen,
              label: '题目数量',
              value: '33 道',
              desc: '30 道通用题 + 3 道所在联邦州特定题',
              iconClass: 'text-blue-500',
              cardClass: 'border-blue-200 bg-gradient-to-br from-white to-blue-50/50',
            },
            {
              icon: Clock,
              label: '限时',
              value: '60 分钟',
              desc: '部分地区为 30 分钟',
              iconClass: 'text-indigo-500',
              cardClass: 'border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50',
            },
            {
              icon: Trophy,
              label: '及格线',
              value: '17 题',
              desc: '答对 17 题即通过',
              iconClass: 'text-violet-500',
              cardClass: 'border-violet-200 bg-gradient-to-br from-white to-violet-50/50',
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`p-6 rounded-2xl border-2 ${item.cardClass} shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5`}
            >
              <item.icon className={`w-8 h-8 mb-3 ${item.iconClass}`} />
              <div className="text-sm font-medium text-gray-500 mb-1">{item.label}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{item.value}</div>
              <div className="text-sm text-gray-600">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 备考建议 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          备考建议
        </h2>
        <div className="space-y-4">
          {[
            '系统学习全部 310 道题目（300 道通用题 + 各州 10 道州题），打好知识基础',
            '多做模拟考试，熟悉 33 题 / 30 分钟的考试节奏，提升实战应变能力',
            '重点复习错题本中的薄弱环节，针对性强化易错知识点',
          ].map((text, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-5 rounded-xl bg-white border-2 border-gray-100 shadow-card hover:border-blue-200 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-gray-700 leading-relaxed pt-0.5">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-2 border-blue-200/50 text-center">
        <p className="text-gray-700 font-medium mb-2">准备好开始了吗？</p>
        <p className="text-sm text-gray-600">登录后解锁完整练习与模拟考试，助您顺利通过入籍考试</p>
      </div>
    </div>
  )
}
