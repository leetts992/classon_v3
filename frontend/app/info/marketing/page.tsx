export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">마케팅 수신 동의</h1>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">목적</h2>
            <p>
              클래스온이 제공하는 이용자 맞춤형 서비스 및 상품 추천, 각종 경품 행사, 이벤트 등의 광고성 정보를 전자우편이나 서신우편, 문자(SMS 또는 카카오 알림톡), 푸시, 전화 등을 통해 이용자에게 제공합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">항목</h2>
            <p>이름, 이메일주소, 휴대전화번호, 마케팅 수신 동의 여부</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">보유 기간</h2>
            <p className="mb-4">회원 탈퇴 후 30일 또는 동의 철회 시까지</p>
            <p>
              마케팅 수신 동의는 거부하실 수 있으며 동의 이후에라도 고객의 의사에 따라 동의를 철회할 수 있습니다. 동의를 거부하시더라도 클래스온이 제공하는 서비스의 이용에 제한이 되지 않습니다. 단, 할인, 이벤트 및 이용자 맞춤형 상품 추천 등의 마케팅 정보 안내 서비스가 제한됩니다.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-lg font-semibold text-gray-900">클래스온 | 마케팅 수신 동의</p>
          </div>
        </div>
      </div>
    </div>
  );
}
