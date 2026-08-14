import { useEffect, useMemo, useState, type FormEventHandler } from 'react';
import { ActionButton } from '../../../../shared/ui/ActionButton';
import { TextField } from '../../../../shared/ui/Field';
import { ToggleSwitch } from '../../../../shared/ui/ToggleSwitch';
import { loginScreenText } from '../constants/loginScreenText';
import type { LoginCredentials, LoginValidationState } from '../types/loginValidation';
import '../styles/LoginForm.css';

type LoginFormProps = {
  autoLogin: boolean;
  onAutoLoginChange: (nextValue: boolean) => void;
  errorMessage: string;
  submitting: boolean;
  onInputChange?: () => void;
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
};

/*
 * 필요: 아이디, 패스워드, 자동로그인, 로그인 버튼의 화면 상태를 관리한다.
 * 연결: LoginPage가 API submit과 오류 메시지를 내려준다.
 * 설명: 입력 중에는 빈값만 검증하고, 제출 후 실제 로그인 API 응답을 기다리는 동안 비동기 확인 상태를 보여 준다.
 * 수정: 화면 문구는 loginScreenText에서 조정하고, 성공/실패 판단은 API 응답만 사용한다.
 */
export function LoginForm({ autoLogin, onAutoLoginChange, errorMessage, submitting, onInputChange, onSubmit }: LoginFormProps) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [idValidation, setIdValidation] = useState<LoginValidationState>({ status: 'idle', message: '' });
  const [passwordValidation, setPasswordValidation] = useState<LoginValidationState>({ status: 'idle', message: '' });
  const [showSlowLoginMessage, setShowSlowLoginMessage] = useState(false);

  const canSubmit = Boolean(loginId.trim() && password) && !submitting;

  function getIdValidation(nextValue: string): LoginValidationState {
    return nextValue.trim()
      ? { status: 'idle', message: '' }
      : { status: 'invalid', message: loginScreenText.validationMessages.idRequired };
  }

  function getPasswordValidation(nextValue: string): LoginValidationState {
    return nextValue ? { status: 'idle', message: '' } : { status: 'invalid', message: loginScreenText.validationMessages.passwordRequired };
  }

  const displayIdStatus = submitting && idValidation.status !== 'invalid' ? 'checking' : idValidation.status;
  const displayPasswordStatus = submitting && passwordValidation.status !== 'invalid' ? 'checking' : passwordValidation.status;

  const fieldStatusClass = useMemo(
    () => ({
      id: displayIdStatus !== 'idle' ? `login-form__field--${displayIdStatus}` : '',
      password: displayPasswordStatus !== 'idle' ? `login-form__field--${displayPasswordStatus}` : ''
    }),
    [displayIdStatus, displayPasswordStatus]
  );

  useEffect(() => {
    if (!submitting) {
      setShowSlowLoginMessage(false);
      return;
    }

    const timerId = window.setTimeout(() => {
      setShowSlowLoginMessage(true);
    }, 3000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [submitting]);

  const formValidation = useMemo<LoginValidationState>(() => {
    if (errorMessage) {
      return { status: 'invalid', message: errorMessage };
    }

    if (submitting) {
      return {
        status: 'checking',
        message: showSlowLoginMessage ? loginScreenText.validationMessages.loginServerWaiting : loginScreenText.validationMessages.loginChecking
      };
    }

    const invalidValidation = [idValidation, passwordValidation].find((validation) => validation.status === 'invalid' && validation.message);
    return invalidValidation ?? { status: 'idle', message: '' };
  }, [errorMessage, idValidation, passwordValidation, showSlowLoginMessage, submitting]);

  function handleIdChange(nextValue: string) {
    onInputChange?.();
    setLoginId(nextValue);
    setIdValidation(getIdValidation(nextValue));
  }

  function handlePasswordChange(nextValue: string) {
    onInputChange?.();
    setPassword(nextValue);
    setPasswordValidation(getPasswordValidation(nextValue));
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const nextIdValidation = getIdValidation(loginId);
    const nextPasswordValidation = getPasswordValidation(password);
    setIdValidation(nextIdValidation);
    setPasswordValidation(nextPasswordValidation);

    if (nextIdValidation.status === 'invalid' || nextPasswordValidation.status === 'invalid') {
      return;
    }

    await onSubmit({ id: loginId.trim(), password });
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="login-form__field-group">
        <TextField
          className={`login-form__field ${fieldStatusClass.id}`.trim()}
          value={loginId}
          placeholder={loginScreenText.idPlaceholder}
          aria-label={loginScreenText.idPlaceholder}
          aria-invalid={idValidation.status === 'invalid'}
          aria-describedby="login-form-validation"
          autoComplete="username"
          onBlur={() => {
            setIdValidation(getIdValidation(loginId));
          }}
          onChange={(event) => handleIdChange(event.target.value)}
        />
      </div>

      <div className="login-form__field-group">
        <div className="field login-form__password-control">
          <input
            className={`input login-form__field login-form__field--password ${fieldStatusClass.password}`.trim()}
            type={isPasswordVisible ? 'text' : 'password'}
            value={password}
            placeholder={loginScreenText.passwordPlaceholder}
            aria-label={loginScreenText.passwordPlaceholder}
            aria-invalid={passwordValidation.status === 'invalid'}
            aria-describedby="login-form-validation"
            autoComplete="current-password"
            onBlur={() => {
              setPasswordValidation(getPasswordValidation(password));
            }}
            onChange={(event) => handlePasswordChange(event.target.value)}
          />
          <button
            type="button"
            className="login-form__password-toggle"
            aria-label={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
            aria-pressed={isPasswordVisible}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              {isPasswordVisible ? (
                <>
                  <path d="M4 4l16 16" />
                  <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                  <path d="M8.5 5.8A10.6 10.6 0 0 1 12 5c5 0 8.5 4.4 9.4 5.7.2.3.2.7 0 1.1a17 17 0 0 1-2.5 3" />
                  <path d="M15.4 15.4A10.4 10.4 0 0 1 12 16c-5 0-8.5-4.4-9.4-5.7a1 1 0 0 1 0-1.1 16 16 0 0 1 3-3.3" />
                </>
              ) : (
                <>
                  <path d="M2.6 11.8a1 1 0 0 1 0-1.1C3.5 9.4 7 5 12 5s8.5 4.4 9.4 5.7c.2.3.2.7 0 1.1C20.5 13.1 17 17 12 17s-8.5-3.9-9.4-5.2Z" />
                  <path d="M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <p
        id="login-form-validation"
        className={`login-form__validation login-form__validation--${formValidation.status}`}
        role={errorMessage ? 'alert' : undefined}
        aria-live="polite"
      >
        {formValidation.message}
      </p>

      <div className="login-form__toggle-row">
        <span className="login-form__toggle-label">{loginScreenText.autoLoginLabel}</span>

        <ToggleSwitch
          className="login-form__toggle"
          checked={autoLogin}
          onChange={onAutoLoginChange}
          onLabel={loginScreenText.autoLoginOnLabel}
          offLabel={loginScreenText.autoLoginOffLabel}
          aria-label={`${loginScreenText.autoLoginLabel} ${autoLogin ? '켜짐' : '꺼짐'}`}
        />
      </div>

      <ActionButton
        type="submit"
        variant="primary"
        size="lg"
        className="login-form__submit"
        aria-disabled={!canSubmit}
        disabled={!canSubmit}
      >
        {submitting ? loginScreenText.submittingSubmitLabel : loginScreenText.submitLabel}
      </ActionButton>
    </form>
  );
}
