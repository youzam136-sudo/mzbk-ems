# MZBK Swagger API v4 Schema / Response Reference

- Date: 2026-05-09 KST
- Source: http://efd.iptime.org:2016/v3/api-docs
- Scope: endpoint request/response schema names and component fields only.
- Note: UI labels and business wording are managed in the PM reconnect plan. This file is intentionally field-name first because several Swagger descriptions have changed repeatedly.

## Endpoint Matrix

### 01. Auth

| method | path | params | requestBody | response |
| --- | --- | --- | --- | --- |
| POST | /auth/login | - | LoginRequest | ApiResponseLoginResponse |
| POST | /auth/logout | - | - | ApiResponseVoid |
| GET | /me | - | - | ApiResponseMeResponse |
| GET | /me/menus | - | - | ApiResponseListMyMenuResponse |

### 01. Dashboard

| method | path | params | requestBody | response |
| --- | --- | --- | --- | --- |
| GET | /dashboard/individual | query:req*:DashboardSearchRequest | - | ApiResponseDashboardIndividualResponse |
| GET | /dashboard/integrated | query:req*:DashboardSearchRequest | - | ApiResponseDashboardIntegratedResponse |

### 02. Monitoring

| method | path | params | requestBody | response |
| --- | --- | --- | --- | --- |
| GET | /monitoring/baseline | query:req*:MonitoringSearchRequest | - | ApiResponsePowerPageResponse |
| GET | /monitoring/baseline/detail | query:req*:MonitoringSearchRequest | - | ApiResponseListPowerDetailResponse |
| GET | /monitoring/peak-respond | query:req*:MonitoringSearchRequest | - | ApiResponsePowerPageResponse |
| GET | /monitoring/peak-respond/detail | query:req*:MonitoringSearchRequest | - | ApiResponseListPowerDetailResponse |
| GET | /monitoring/power-supply | query:req*:MonitoringSearchRequest | - | ApiResponsePowerPageResponse |
| GET | /monitoring/power-supply/detail | query:req*:MonitoringSearchRequest | - | ApiResponseListPowerDetailResponse |
| GET | /monitoring/reserved | query:req*:MonitoringSearchRequest | - | ApiResponsePowerPageResponse |
| GET | /monitoring/reserved/detail | query:req*:MonitoringSearchRequest | - | ApiResponseListPowerDetailResponse |

### 02. System-Role

| method | path | params | requestBody | response |
| --- | --- | --- | --- | --- |
| GET | /system/roles | query:req*:SearchRequestDto | - | ApiResponsePageResponseDtoRoleResponse |
| POST | /system/roles | - | RoleSaveRequest | ApiResponseVoid |
| DELETE | /system/roles/{roleId} | path:roleId*:string | - | ApiResponseVoid |
| GET | /system/roles/{roleId} | path:roleId*:string | - | ApiResponseRoleResponse |
| PUT | /system/roles/{roleId} | path:roleId*:string | RoleSaveRequest | ApiResponseVoid |
| GET | /system/roles/{roleId}/menus | path:roleId*:string | - | ApiResponseListRoleMenuResponse |
| POST | /system/roles/{roleId}/menus | path:roleId*:string | RoleMenuSaveRequest | ApiResponseVoid |
| GET | /system/roles/{roleId}/menus/tree | path:roleId*:string | - | ApiResponseListRoleMenuTreeResponse |

### 03. System-Menu

| method | path | params | requestBody | response |
| --- | --- | --- | --- | --- |
| GET | /system/menus | query:req*:SearchRequestDto | - | ApiResponsePageResponseDtoMenuResponse |
| POST | /system/menus | - | MenuSaveRequest | ApiResponseMapStringString |
| DELETE | /system/menus/{menuId} | path:menuId*:string | DeleteRequestDto | ApiResponseVoid |
| GET | /system/menus/{menuId} | path:menuId*:string | - | ApiResponseMenuResponse |
| PUT | /system/menus/{menuId} | path:menuId*:string | MenuSaveRequest | ApiResponseVoid |
| GET | /system/menus/tree | - | - | ApiResponseListMenuTreeResponse |
| GET | /system/menus/use-tree | - | - | ApiResponseListMenuTreeResponse |

### 03. Trend

| method | path | params | requestBody | response |
| --- | --- | --- | --- | --- |
| GET | /trend/baseline | query:req*:TrendSearchRequest | - | ApiResponsePowerPageResponse |
| GET | /trend/peak-respond | query:req*:TrendSearchRequest | - | ApiResponsePowerPageResponse |
| GET | /trend/power-supply | query:req*:TrendSearchRequest | - | ApiResponsePowerPageResponse |
| GET | /trend/reserved | query:req*:TrendSearchRequest | - | ApiResponsePowerPageResponse |

### 04. Report

| method | path | params | requestBody | response |
| --- | --- | --- | --- | --- |
| GET | /report/daily | query:req*:ReportSearchRequest | - | ApiResponsePowerPageResponse |
| GET | /report/monthly | query:req*:ReportSearchRequest | - | ApiResponsePowerPageResponse |
| GET | /report/weekly | query:req*:ReportSearchRequest | - | ApiResponsePowerPageResponse |
| GET | /report/yearly | query:req*:ReportSearchRequest | - | ApiResponsePowerPageResponse |

### 04. System-User

| method | path | params | requestBody | response |
| --- | --- | --- | --- | --- |
| GET | /system/users | query:req*:SearchRequestDto | - | ApiResponsePageResponseDtoUserResponse |
| POST | /system/users | - | UserSaveRequest | ApiResponseVoid |
| DELETE | /system/users/{usrId} | path:usrId*:string | DeleteRequestDto | ApiResponseVoid |
| GET | /system/users/{usrId} | path:usrId*:string | - | ApiResponseUserResponse |
| PUT | /system/users/{usrId} | path:usrId*:string | UserSaveRequest | ApiResponseVoid |
| GET | /system/users/{usrId}/roles | path:usrId*:string | - | ApiResponseListUserRoleResponse |

### 05. System-Code

| method | path | params | requestBody | response |
| --- | --- | --- | --- | --- |
| GET | /system/codes | query:req*:SearchRequestDto | - | ApiResponsePageResponseDtoCodeResponse |
| POST | /system/codes | - | CodeSaveRequest | ApiResponseVoid |
| DELETE | /system/codes/{cdId} | path:cdId*:string | DeleteRequestDto | ApiResponseVoid |
| GET | /system/codes/{cdId} | path:cdId*:string | - | ApiResponseCodeResponse |
| PUT | /system/codes/{cdId} | path:cdId*:string | CodeSaveRequest | ApiResponseVoid |
| GET | /system/codes/{cdId}/children | path:cdId*:string | - | ApiResponseListCodeResponse |

### 06. Master Plant

| method | path | params | requestBody | response |
| --- | --- | --- | --- | --- |
| GET | /master/plants | query:req*:MasterSearchRequest | - | ApiResponsePageResponseDtoPlantMasterResponse |
| POST | /master/plants | - | PlantMasterRequest | ApiResponsePlantMasterResponse |
| DELETE | /master/plants/{plntId}/{plntSeq} | path:plntId*:string, path:plntSeq*:string | - | ApiResponseVoid |
| GET | /master/plants/{plntId}/{plntSeq} | path:plntId*:string, path:plntSeq*:string | - | ApiResponsePlantMasterResponse |
| PUT | /master/plants/{plntId}/{plntSeq} | path:plntId*:string, path:plntSeq*:string | PlantMasterRequest | ApiResponsePlantMasterResponse |
| GET | /master/plants/init | - | - | ApiResponseMasterInitResponse |

### 07. Master PCS

| method | path | params | requestBody | response |
| --- | --- | --- | --- | --- |
| GET | /master/pcs | query:req*:MasterSearchRequest | - | ApiResponsePageResponseDtoPcsMasterResponse |
| POST | /master/pcs | - | PcsMasterRequest | ApiResponsePcsMasterResponse |
| DELETE | /master/pcs/{pcsId}/{pcsSeq} | path:pcsId*:string, path:pcsSeq*:string | - | ApiResponseVoid |
| GET | /master/pcs/{pcsId}/{pcsSeq} | path:pcsId*:string, path:pcsSeq*:string | - | ApiResponsePcsMasterResponse |
| PUT | /master/pcs/{pcsId}/{pcsSeq} | path:pcsId*:string, path:pcsSeq*:string | PcsMasterRequest | ApiResponsePcsMasterResponse |

### 08. Master Battery

| method | path | params | requestBody | response |
| --- | --- | --- | --- | --- |
| GET | /master/batteries | query:req*:MasterSearchRequest | - | ApiResponsePageResponseDtoBatteryMasterResponse |
| POST | /master/batteries | - | BatteryMasterRequest | ApiResponseBatteryMasterResponse |
| DELETE | /master/batteries/{batId}/{batSeq} | path:batId*:string, path:batSeq*:string | - | ApiResponseVoid |
| GET | /master/batteries/{batId}/{batSeq} | path:batId*:string, path:batSeq*:string | - | ApiResponseBatteryMasterResponse |
| PUT | /master/batteries/{batId}/{batSeq} | path:batId*:string, path:batSeq*:string | BatteryMasterRequest | ApiResponseBatteryMasterResponse |

### 09. Master Inverter

| method | path | params | requestBody | response |
| --- | --- | --- | --- | --- |
| GET | /master/inverters | query:req*:MasterSearchRequest | - | ApiResponsePageResponseDtoInverterMasterResponse |
| POST | /master/inverters | - | InverterMasterRequest | ApiResponseInverterMasterResponse |
| DELETE | /master/inverters/{ivtId}/{ivtSeq} | path:ivtId*:string, path:ivtSeq*:string | - | ApiResponseVoid |
| GET | /master/inverters/{ivtId}/{ivtSeq} | path:ivtId*:string, path:ivtSeq*:string | - | ApiResponseInverterMasterResponse |
| PUT | /master/inverters/{ivtId}/{ivtSeq} | path:ivtId*:string, path:ivtSeq*:string | InverterMasterRequest | ApiResponseInverterMasterResponse |

### 10. Master Diesel

| method | path | params | requestBody | response |
| --- | --- | --- | --- | --- |
| GET | /master/diesels | query:req*:MasterSearchRequest | - | ApiResponsePageResponseDtoDieselMasterResponse |
| POST | /master/diesels | - | DieselMasterRequest | ApiResponseDieselMasterResponse |
| DELETE | /master/diesels/{dslId}/{dslSeq} | path:dslId*:string, path:dslSeq*:string | - | ApiResponseVoid |
| GET | /master/diesels/{dslId}/{dslSeq} | path:dslId*:string, path:dslSeq*:string | - | ApiResponseDieselMasterResponse |
| PUT | /master/diesels/{dslId}/{dslSeq} | path:dslId*:string, path:dslSeq*:string | DieselMasterRequest | ApiResponseDieselMasterResponse |

### 18. Excel

| method | path | params | requestBody | response |
| --- | --- | --- | --- | --- |
| GET | /excel/{type} | path:type*:string, query:req*:ExcelDownloadRequest | - | string |

## Core Payload Pointers

- Auth: LoginRequest -> ApiResponseLoginResponse -> LoginResponse.
- Session: ApiResponseMeResponse, ApiResponseListMyMenuResponse.
- Dashboard: ApiResponseDashboardIntegratedResponse, ApiResponseDashboardIndividualResponse.
- Monitoring/Trend/Report: ApiResponsePowerPageResponse, ApiResponseListPowerDetailResponse.
- Master init: ApiResponseMasterInitResponse.
- Master list: ApiResponsePageResponseDto*MasterResponse.
- Master create/update/detail: ApiResponse*MasterResponse.

## Component Schemas

## ApiResponseBatteryMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | BatteryMasterResponse | N | - |

## ApiResponseCodeResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | CodeResponse | N | - |

## ApiResponseDashboardIndividualResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | DashboardIndividualResponse | N | - |

## ApiResponseDashboardIntegratedResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | DashboardIntegratedResponse | N | - |

## ApiResponseDieselMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | DieselMasterResponse | N | - |

## ApiResponseInverterMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | InverterMasterResponse | N | - |

## ApiResponseListCodeResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | array<CodeResponse> | N | - |

## ApiResponseListMenuTreeResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | array<MenuTreeResponse> | N | - |

## ApiResponseListMyMenuResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | array<MyMenuResponse> | N | - |

## ApiResponseListPowerDetailResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | array<PowerDetailResponse> | N | - |

## ApiResponseListRoleMenuResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | array<RoleMenuResponse> | N | - |

## ApiResponseListRoleMenuTreeResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | array<RoleMenuTreeResponse> | N | - |

## ApiResponseListUserRoleResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | array<UserRoleResponse> | N | - |

## ApiResponseLoginResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | LoginResponse | N | - |

## ApiResponseMapStringString

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | map<string, string> | N | - |

## ApiResponseMasterInitResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | MasterInitResponse | N | - |

## ApiResponseMenuResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | MenuResponse | N | - |

## ApiResponseMeResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | MeResponse | N | - |

## ApiResponsePageResponseDtoBatteryMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | PageResponseDtoBatteryMasterResponse | N | - |

## ApiResponsePageResponseDtoCodeResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | PageResponseDtoCodeResponse | N | - |

## ApiResponsePageResponseDtoDieselMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | PageResponseDtoDieselMasterResponse | N | - |

## ApiResponsePageResponseDtoInverterMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | PageResponseDtoInverterMasterResponse | N | - |

## ApiResponsePageResponseDtoMenuResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | PageResponseDtoMenuResponse | N | - |

## ApiResponsePageResponseDtoPcsMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | PageResponseDtoPcsMasterResponse | N | - |

## ApiResponsePageResponseDtoPlantMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | PageResponseDtoPlantMasterResponse | N | - |

## ApiResponsePageResponseDtoRoleResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | PageResponseDtoRoleResponse | N | - |

## ApiResponsePageResponseDtoUserResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | PageResponseDtoUserResponse | N | - |

## ApiResponsePcsMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | PcsMasterResponse | N | - |

## ApiResponsePlantMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | PlantMasterResponse | N | - |

## ApiResponsePowerPageResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | PowerPageResponse | N | - |

## ApiResponseRoleResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | RoleResponse | N | - |

## ApiResponseUserResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | UserResponse | N | - |

## ApiResponseVoid

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| success | boolean | N | true |
| message | string | N | "정상 처리되었습니다." |
| data | object | N | - |

## BatteryMasterRequest

- type: `object`
- required: `batSeril`

| field | type | required | example |
| --- | --- | --- | --- |
| batId | string | N | - |
| batSeq | string | N | - |
| batSeril | string | Y | "BAT-SERIAL-001" |
| makerNm | string | N | "EFD" |
| modlNm | string | N | "BAT-MODEL-001" |
| capaSize | string | N | "100" |
| rackCnt | string | N | "1" |
| rackMdulCnt | string | N | "10" |
| mdulCapaSize | string | N | "10" |
| dodRatio | string | N | "80" |
| batMemo | string | N | "샘플 배터리" |

## BatteryMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| batId | string | N | - |
| batSeq | string | N | - |
| batSeril | string | N | - |
| makerNm | string | N | - |
| modlNm | string | N | - |
| capaSize | string | N | - |
| rackCnt | string | N | - |
| rackMdulCnt | string | N | - |
| mdulCapaSize | string | N | - |
| dodRatio | string | N | - |
| batMemo | string | N | - |
| batDelyn | string | N | - |
| regtDttm | string | N | - |
| regtId | string | N | - |
| updtDttm | string | N | - |
| updtId | string | N | - |

## CodeResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| cdId | string | N | "USE_YN" |
| cdNm | string | N | "사용여부" |
| uprCdId | string | N | "ROLE_GRP" |
| cdDesc | string | N | "사용 여부 코드" |
| sortOrd | integer | N | 1 |
| useYn | string | N | "Y" |

## CodeSaveRequest

- type: `object`
- required: `cdId`, `cdNm`

| field | type | required | example |
| --- | --- | --- | --- |
| cdId | string | Y | "ROLE_ADMIN" |
| cdNm | string | Y | "관리자" |
| uprCdId | string | N | "ROLE_GRP" |
| cdDesc | string | N | "관리자 권한" |
| sortOrd | integer | N | 1 |
| useYn | string | N | "Y" |

## DashboardAcResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| status | string | N | - |
| dischargeAirTemperature | string | N | - |
| temperature | string | N | - |
| humidity | string | N | - |

## DashboardAgcResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| activePower | string | N | - |
| reactivePower | string | N | - |
| apparentPower | string | N | - |
| pf | string | N | - |
| voltageL12 | string | N | - |
| voltageL23 | string | N | - |
| voltageL31 | string | N | - |
| currentL1 | string | N | - |
| currentL2 | string | N | - |
| currentL3 | string | N | - |
| frequencyL1 | string | N | - |
| frequencyL2 | string | N | - |
| frequencyL3 | string | N | - |

## DashboardBankResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| bankId | string | N | - |
| bankName | string | N | - |
| totalPower | string | N | - |
| threePhasePower | string | N | - |
| singlePhasePower | string | N | - |
| activePower | string | N | - |
| reactivePower | string | N | - |
| pf | string | N | - |

## DashboardBatteryResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| status | string | N | - |
| soc | string | N | - |
| soh | string | N | - |
| rackVoltageMax | string | N | - |
| rackVoltageMin | string | N | - |
| rackVoltageAvg | string | N | - |
| rackCurrentMax | string | N | - |
| rackCurrentMin | string | N | - |
| rackCurrentAvg | string | N | - |
| packTempMax | string | N | - |
| packTempMin | string | N | - |
| packTempAvg | string | N | - |
| dcVoltage | string | N | - |
| dcCurrent | string | N | - |
| chargeKwh | string | N | - |
| dischargeKwh | string | N | - |

## DashboardDieselResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| status | string | N | - |
| totalPower | string | N | - |
| powerL1 | string | N | - |
| powerL2 | string | N | - |
| powerL3 | string | N | - |
| pf | string | N | - |
| voltageL12 | string | N | - |
| voltageL23 | string | N | - |
| voltageL31 | string | N | - |
| currentL1 | string | N | - |
| currentL2 | string | N | - |
| currentL3 | string | N | - |
| frequency | string | N | - |
| rpm | string | N | - |
| fuel | string | N | - |
| coolantTemp | string | N | - |
| oilTemp | string | N | - |
| oilPress | string | N | - |
| runningHour | string | N | - |

## DashboardIndividualResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| menuId | string | N | - |
| pageTitle | string | N | - |
| operYmd | string | N | - |
| operTime | string | N | - |
| refreshSeconds | integer | N | - |
| ac | DashboardAcResponse | N | - |
| battery | DashboardBatteryResponse | N | - |
| pcs | DashboardPcsResponse | N | - |
| diesel | DashboardDieselResponse | N | - |
| solar | DashboardAgcResponse | N | - |
| btb | DashboardAgcResponse | N | - |
| storage | DashboardStorageResponse | N | - |
| inverterList | array<DashboardInverterResponse> | N | - |
| bankList | array<DashboardBankResponse> | N | - |

## DashboardIntegratedResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| menuId | string | N | - |
| pageTitle | string | N | - |
| operYmd | string | N | - |
| operTime | string | N | - |
| refreshSeconds | integer | N | - |
| ac | DashboardAcResponse | N | - |
| battery | DashboardBatteryResponse | N | - |
| pcs | DashboardPcsResponse | N | - |
| diesel | DashboardDieselResponse | N | - |
| solar | DashboardAgcResponse | N | - |
| btb | DashboardAgcResponse | N | - |
| storage | DashboardStorageResponse | N | - |
| inverterList | array<DashboardInverterResponse> | N | - |
| bankList | array<DashboardBankResponse> | N | - |

## DashboardInverterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| inverterId | string | N | - |
| inverterName | string | N | - |
| status | string | N | - |
| dcPower | string | N | - |
| acPower | string | N | - |
| efficiency | string | N | - |
| activePower | string | N | - |
| reactivePower | string | N | - |
| apparentPower | string | N | - |
| pf | string | N | - |
| dailyActiveAccmPower | string | N | - |
| dailyReactiveAccmPower | string | N | - |

## DashboardPcsResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| status | string | N | - |
| dcVoltage | string | N | - |
| dcCurrent | string | N | - |
| dcPower | string | N | - |
| activePower | string | N | - |
| reactivePower | string | N | - |
| apparentPower | string | N | - |
| pf | string | N | - |
| voltageL12 | string | N | - |
| voltageL23 | string | N | - |
| voltageL31 | string | N | - |
| currentL1 | string | N | - |
| currentL2 | string | N | - |
| currentL3 | string | N | - |
| moduleTemp | string | N | - |
| ambientTemp | string | N | - |
| cabinetTemp | string | N | - |

## DashboardSearchRequest

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| operYmd | string | N | "2026-05-08" |
| operTime | string | N | "13:20:00" |
| inverterId | string | N | "IVT0001" |

## DashboardStorageResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| nowKw | string | N | - |
| dayKw | string | N | - |
| nowKvar | string | N | - |
| dayKvar | string | N | - |
| nowPf | string | N | - |
| dayPf | string | N | - |

## DeleteRequestDto

- type: `object`
- required: `reason`

| field | type | required | example |
| --- | --- | --- | --- |
| reason | string | Y | "미사용 데이터 정리" |

## DieselMasterRequest

- type: `object`
- required: `dslSeril`

| field | type | required | example |
| --- | --- | --- | --- |
| dslId | string | N | - |
| dslSeq | string | N | - |
| dslSeril | string | Y | "DSL-SERIAL-001" |
| makerNm | string | N | "EFD" |
| modlNm | string | N | "DSL-MODEL-001" |
| capaSize | string | N | "100" |
| fuelCd | string | N | "DIESEL" |
| stndRpmSize | string | N | "1800" |
| nmalOutV | string | N | "380" |
| nmalOutA | string | N | "150" |
| dslMemo | string | N | "샘플 디젤발전기" |

## DieselMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| dslId | string | N | - |
| dslSeq | string | N | - |
| dslSeril | string | N | - |
| makerNm | string | N | - |
| modlNm | string | N | - |
| capaSize | string | N | - |
| fuelCd | string | N | - |
| stndRpmSize | string | N | - |
| nmalOutV | string | N | - |
| nmalOutA | string | N | - |
| dslMemo | string | N | - |
| dslDelyn | string | N | - |
| regtDttm | string | N | - |
| regtId | string | N | - |
| updtDttm | string | N | - |
| updtId | string | N | - |

## ExcelDownloadRequest

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| plntId | string | N | "PLNT001" |
| plntSeq | string | N | "001" |
| deviceId | string | N | "PCS001" |
| deviceSeq | string | N | "001" |
| startDate | string | N | "2026-04-01" |
| endDate | string | N | "2026-04-24" |
| keyword | string | N | - |

## InverterMasterRequest

- type: `object`
- required: `ivtSeril`

| field | type | required | example |
| --- | --- | --- | --- |
| ivtId | string | N | - |
| ivtSeq | string | N | - |
| ivtSeril | string | Y | "IVT-SERIAL-001" |
| makerNm | string | N | "EFD" |
| modlNm | string | N | "IVT-MODEL-001" |
| capaSize | string | N | "100" |
| nmalInpV | string | N | "750" |
| nmalInpA | string | N | "100" |
| nmalOutV | string | N | "380" |
| nmalOutA | string | N | "150" |
| ivtMemo | string | N | "샘플 인버터" |

## InverterMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| ivtId | string | N | - |
| ivtSeq | string | N | - |
| ivtSeril | string | N | - |
| makerNm | string | N | - |
| modlNm | string | N | - |
| capaSize | string | N | - |
| nmalInpV | string | N | - |
| nmalInpA | string | N | - |
| nmalOutV | string | N | - |
| nmalOutA | string | N | - |
| ivtMemo | string | N | - |
| ivtDelyn | string | N | - |
| regtDttm | string | N | - |
| regtId | string | N | - |
| updtDttm | string | N | - |
| updtId | string | N | - |

## Item

- type: `object`
- required: `sysMenuId`

| field | type | required | example |
| --- | --- | --- | --- |
| sysMenuId | string | Y | "MNU000001" |
| readYn | string | N | "Y" |
| writeYn | string | N | "N" |
| useYn | string | N | "Y" |

## LoginRequest

- type: `object`
- required: `password`, `userId`

| field | type | required | example |
| --- | --- | --- | --- |
| userId | string | Y | "admin" |
| password | string | Y | "Admin123!" |

## LoginResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| accessToken | string | N | - |
| tokenType | string | N | "Bearer" |
| userId | string | N | "admin" |
| userName | string | N | "시스템관리자" |
| roleIds | array<string> | N | - |

## MasterInitResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| plants | array<PlantMasterResponse> | N | - |
| pcsList | array<PcsMasterResponse> | N | - |
| batteries | array<BatteryMasterResponse> | N | - |
| inverters | array<InverterMasterResponse> | N | - |
| diesels | array<DieselMasterResponse> | N | - |

## MasterSearchRequest

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| page | integer | N | 1 |
| size | integer | N | 20 |
| keyword | string | N | "EFD" |
| useYn | string | N | "Y" |
| startDate | string | N | "2026-04-01" |
| endDate | string | N | "2026-04-24" |

## MenuResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| sysMenuId | string | N | "MNU000001" |
| sysUprmenuId | string | N | "MNU000000" |
| menuNm | string | N | "사용자관리" |
| menuUrl | string | N | "/system/users" |
| menuLvl | integer | N | 2 |
| sortOrd | integer | N | 1 |
| useYn | string | N | "Y" |

## MenuSaveRequest

- type: `object`
- required: `menuLvl`, `menuNm`, `sortOrd`

| field | type | required | example |
| --- | --- | --- | --- |
| sysMenuId | string | N | "MNU000001" |
| sysUprmenuId | string | N | "MNU000000" |
| menuNm | string | Y | "사용자관리" |
| menuUrl | string | N | "/system/users" |
| menuLvl | integer | Y | 2 |
| sortOrd | integer | Y | 1 |
| useYn | string | N | "Y" |

## MenuTreeResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| sysMenuId | string | N | - |
| menuNm | string | N | - |
| menuUrl | string | N | - |
| menuLvl | integer | N | - |
| sortOrd | integer | N | - |
| children | array<MenuTreeResponse> | N | - |

## MeResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| userId | string | N | "admin" |
| userName | string | N | "시스템관리자" |
| roleIds | array<string> | N | - |

## MonitoringSearchRequest

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| operYmd | string | N | "2026-05-08" |
| operTime | string | N | "13" |

## MyMenuResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| sysMenuId | string | N | - |
| sysUprmenuId | string | N | - |
| menuNm | string | N | - |
| menuUrl | string | N | - |
| menuLvl | integer | N | - |
| sortOrd | integer | N | - |
| children | array<MyMenuResponse> | N | - |

## PageResponseDtoBatteryMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| contents | array<BatteryMasterResponse> | N | - |
| totalCount | integer | N | 100 |
| page | integer | N | 1 |
| size | integer | N | 20 |
| totalPage | integer | N | 5 |

## PageResponseDtoCodeResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| contents | array<CodeResponse> | N | - |
| totalCount | integer | N | 100 |
| page | integer | N | 1 |
| size | integer | N | 20 |
| totalPage | integer | N | 5 |

## PageResponseDtoDieselMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| contents | array<DieselMasterResponse> | N | - |
| totalCount | integer | N | 100 |
| page | integer | N | 1 |
| size | integer | N | 20 |
| totalPage | integer | N | 5 |

## PageResponseDtoInverterMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| contents | array<InverterMasterResponse> | N | - |
| totalCount | integer | N | 100 |
| page | integer | N | 1 |
| size | integer | N | 20 |
| totalPage | integer | N | 5 |

## PageResponseDtoMenuResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| contents | array<MenuResponse> | N | - |
| totalCount | integer | N | 100 |
| page | integer | N | 1 |
| size | integer | N | 20 |
| totalPage | integer | N | 5 |

## PageResponseDtoPcsMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| contents | array<PcsMasterResponse> | N | - |
| totalCount | integer | N | 100 |
| page | integer | N | 1 |
| size | integer | N | 20 |
| totalPage | integer | N | 5 |

## PageResponseDtoPlantMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| contents | array<PlantMasterResponse> | N | - |
| totalCount | integer | N | 100 |
| page | integer | N | 1 |
| size | integer | N | 20 |
| totalPage | integer | N | 5 |

## PageResponseDtoRoleResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| contents | array<RoleResponse> | N | - |
| totalCount | integer | N | 100 |
| page | integer | N | 1 |
| size | integer | N | 20 |
| totalPage | integer | N | 5 |

## PageResponseDtoUserResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| contents | array<UserResponse> | N | - |
| totalCount | integer | N | 100 |
| page | integer | N | 1 |
| size | integer | N | 20 |
| totalPage | integer | N | 5 |

## PcsMasterRequest

- type: `object`
- required: `pcsSeril`

| field | type | required | example |
| --- | --- | --- | --- |
| pcsId | string | N | - |
| pcsSeq | string | N | - |
| pcsSeril | string | Y | "PCS-SERIAL-001" |
| makerNm | string | N | "EFD" |
| modlNm | string | N | "PCS-MODEL-001" |
| capaSize | string | N | "100" |
| nmalInpV | string | N | "750" |
| nmalInpA | string | N | "100" |
| nmalOutV | string | N | "380" |
| nmalOutA | string | N | "150" |
| pcsMemo | string | N | "샘플 PCS" |

## PcsMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| pcsId | string | N | - |
| pcsSeq | string | N | - |
| pcsSeril | string | N | - |
| makerNm | string | N | - |
| modlNm | string | N | - |
| capaSize | string | N | - |
| nmalInpV | string | N | - |
| nmalInpA | string | N | - |
| nmalOutV | string | N | - |
| nmalOutA | string | N | - |
| pcsMemo | string | N | - |
| pcsDelyn | string | N | - |
| regtDttm | string | N | - |
| regtId | string | N | - |
| updtDttm | string | N | - |
| updtId | string | N | - |

## PlantMasterRequest

- type: `object`
- required: `plntNm`, `pplntGpsLatd`, `pplntGpsLntd`

| field | type | required | example |
| --- | --- | --- | --- |
| plntId | string | N | - |
| plntSeq | string | N | - |
| plntNm | string | Y | "샘플 발전소" |
| plntComtYmd | string | N | "2026-04-01" |
| plntOperYmd | string | N | "2026-04-24" |
| pplntGpsLatd | string | Y | "34.95" |
| pplntGpsLntd | string | Y | "127.48" |
| plntAddr | string | N | "전라남도 순천시" |
| plntVndrNm | string | N | "EFD" |
| plntVndrPhon | string | N | "061-000-0000" |
| plntVndrEmail | string | N | "efd@local.test" |
| plntMntcNm | string | N | "EFD" |
| plntMntcPhon | string | N | "061-000-0000" |
| plntMntcEmail | string | N | "efd@local.test" |
| pplntMemo | string | N | "초기 샘플 발전소" |

## PlantMasterResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| plntId | string | N | - |
| plntSeq | string | N | - |
| plntNm | string | N | - |
| plntComtYmd | string | N | - |
| plntOperYmd | string | N | - |
| pplntGpsLatd | string | N | - |
| pplntGpsLntd | string | N | - |
| plntAddr | string | N | - |
| plntVndrNm | string | N | - |
| plntVndrPhon | string | N | - |
| plntVndrEmail | string | N | - |
| plntMntcNm | string | N | - |
| plntMntcPhon | string | N | - |
| plntMntcEmail | string | N | - |
| pplntMemo | string | N | - |
| pplntDelyn | string | N | - |
| regtDttm | string | N | - |
| regtId | string | N | - |
| updtDttm | string | N | - |
| updtId | string | N | - |

## PowerChartResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| baseLabel | string | N | "13" |
| outputUnit | string | N | - |
| barValue | string | N | - |
| barName | string | N | - |
| lineValue1 | string | N | - |
| lineName1 | string | N | - |
| lineValue2 | string | N | - |
| lineName2 | string | N | - |

## PowerDetailResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| esmtOperYmd | string | N | - |
| esmtOperTime | string | N | - |
| powerFlowType | string | N | - |
| sourceTable | string | N | - |
| powerColumn | string | N | - |
| calculationDesc | string | N | - |
| formula | string | N | - |
| rawPower | string | N | - |
| voltageL1 | string | N | - |
| voltageL2 | string | N | - |
| voltageL3 | string | N | - |
| currentL1 | string | N | - |
| currentL2 | string | N | - |
| currentL3 | string | N | - |
| frequency | string | N | - |
| pf | string | N | - |
| soc | string | N | - |
| soh | string | N | - |
| temperature | string | N | - |
| rpm | string | N | - |
| tankLevel | string | N | - |
| oilPress | string | N | - |
| statusValue | string | N | - |

## PowerPageResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| powerFlowType | string | N | - |
| pageTitle | string | N | - |
| outputUnit | string | N | - |
| summary | PowerSummaryResponse | N | - |
| chartList | array<PowerChartResponse> | N | - |
| tableList | array<PowerTableResponse> | N | - |

## PowerSummaryResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| startDate | string | N | - |
| endDate | string | N | - |
| dataCount | integer | N | - |
| totalPowerKwh | string | N | - |
| chargeKwh | string | N | - |
| dischargeKwh | string | N | - |
| avgVoltage | string | N | - |
| avgCurrent | string | N | - |
| avgFrequency | string | N | - |
| avgPf | string | N | - |
| avgSoc | string | N | - |
| avgSoh | string | N | - |
| avgTemperature | string | N | - |
| avgRpm | string | N | - |
| avgTankLevel | string | N | - |
| avgOilPress | string | N | - |

## PowerTableResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| operYmd | string | N | - |
| operTime | string | N | - |
| baseLabel | string | N | - |
| powerKwh | string | N | - |
| chargeKwh | string | N | - |
| dischargeKwh | string | N | - |
| voltage | string | N | - |
| current | string | N | - |
| frequency | string | N | - |
| pf | string | N | - |
| soc | string | N | - |
| soh | string | N | - |
| temperature | string | N | - |
| rpm | string | N | - |
| tankLevel | string | N | - |
| oilPress | string | N | - |
| detailYn | string | N | - |

## ReportSearchRequest

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| operYmd | string | N | "2026-05-07" |
| baseYear | string | N | "2026" |
| baseMonth | string | N | "05" |
| baseWeek | string | N | "19" |

## RoleMenuResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| roleId | string | N | "ROLE_ADMIN" |
| sysMenuId | string | N | "MNU000001" |
| sysUprmenuId | string | N | - |
| menuNm | string | N | "사용자관리" |
| menuUrl | string | N | "/system/users" |
| menuLvl | integer | N | 2 |
| sortOrd | integer | N | 1 |
| mappedYn | string | N | "Y" |
| readYn | string | N | "Y" |
| writeYn | string | N | "Y" |
| useYn | string | N | "Y" |

## RoleMenuSaveRequest

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| items | array<Item> | N | - |

## RoleMenuTreeResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| roleId | string | N | "ROLE_ADMIN" |
| sysMenuId | string | N | "MNU000001" |
| menuNm | string | N | "시스템관리" |
| menuUrl | string | N | "/system/users" |
| mappedYn | string | N | "Y" |
| readYn | string | N | "Y" |
| writeYn | string | N | "Y" |
| children | array<RoleMenuTreeResponse> | N | - |

## RoleResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| roleId | string | N | "ROLE_ADMIN" |
| roleNm | string | N | "관리자" |
| roleDesc | string | N | "시스템 관리자 권한" |
| useYn | string | N | "Y" |

## RoleSaveRequest

- type: `object`
- required: `roleId`, `roleNm`

| field | type | required | example |
| --- | --- | --- | --- |
| roleId | string | Y | "ROLE_MANAGER" |
| roleNm | string | Y | "운영관리자" |
| roleDesc | string | N | "운영 화면 접근 권한" |
| useYn | string | N | "Y" |

## SearchRequestDto

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| page | integer | N | 1 |
| size | integer | N | 20 |
| keyword | string | N | "관리자" |
| useYn | string | N | "Y" |
| startDate | string | N | "2026-04-01" |
| endDate | string | N | "2026-04-24" |

## TrendSearchRequest

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| searchDateType | string | N | "MONTH" |
| startDate | string | N | "2026-05-01" |
| endDate | string | N | "2026-05-08" |
| resolvedStartDate | string | N | - |
| resolvedEndDate | string | N | - |
| outputUnit | string | N | - |

## UserResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| usrId | string | N | "admin" |
| usrNm | string | N | "시스템관리자" |
| email | string | N | "admin@local.test" |
| mobileNo | string | N | "010-0000-0000" |
| useYn | string | N | "Y" |
| lockYn | string | N | "N" |
| failCnt | integer | N | 0 |
| lastLoginDttm | string | N | - |
| lastLogoutDttm | string | N | - |

## UserRoleResponse

- type: `object`
- required: -

| field | type | required | example |
| --- | --- | --- | --- |
| usrId | string | N | "admin" |
| roleId | string | N | "ROLE_ADMIN" |
| roleNm | string | N | "관리자" |
| useYn | string | N | "Y" |

## UserSaveRequest

- type: `object`
- required: `usrId`, `usrNm`

| field | type | required | example |
| --- | --- | --- | --- |
| usrId | string | Y | "user01" |
| usrNm | string | Y | "일반사용자" |
| usrPwd | string | N | "User123!" |
| email | string | N | "user01@local.test" |
| mobileNo | string | N | "010-0000-0000" |
| useYn | string | N | "Y" |
| lockYn | string | N | "N" |
| roleIds | array<string> | N | ["ROLE_USER"] |
