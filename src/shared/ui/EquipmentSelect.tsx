import type { SelectHTMLAttributes } from 'react';
import './EquipmentSelect.css';

export type EquipmentOption = {
  label: string;
  value: string;
};

type EquipmentSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  options: EquipmentOption[];
};

/*
 * 필요: Inverter, Diesel, Battery 같은 장비 선택 UI를 공통으로 표시한다.
 * 연결: feature별 equipmentOptions API view model과 section state.
 * 설명: 선택값 표시와 변경 이벤트만 전달하고 데이터 조회는 호출부 hook에서 처리한다.
 * 수정: 장비명 목록은 화면 adapter, 셀렉트 모양은 EquipmentSelect.css에서 조정한다.
 */
export function EquipmentSelect({ options, className = '', ...props }: EquipmentSelectProps) {
  return (
    <select className={`equipment-select ${className}`.trim()} {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
