import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { CONFIG } from '../../config/constants';
import { useAuthForm } from './useAuthForm';
import '../../assets/css/auth.css';

const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type VerificationAction = 'submit' | 'forgot' | null;

declare global {
  interface Window {
    hcaptcha?: { render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void; hl: string; theme: 'dark' }) => number; remove: (widgetId: number) => void; };
  }
}

function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (checked: boolean) => void; children: ReactNode }) {
  return <label className="auth-checkbox-option"><input className="hidden-visually" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className={`auth-checkbox-indicator ${checked ? 'is-checked' : ''}`} aria-hidden="true">{checked && '✓'}</span><span className="auth-checkbox-label">{children}</span></label>;
}

function DateSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);
  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => { if (!containerRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [open]);
  return <div ref={containerRef} className="auth-select-container">
    <button className={`auth-select-trigger ${open ? 'is-open' : ''}`} type="button" aria-label={label} aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <span className={selected ? 'auth-select-value' : 'auth-select-placeholder'}>{selected?.label ?? label}</span><span className={`auth-select-chevron ${open ? 'is-open' : ''}`} aria-hidden="true">⌄</span>
    </button>
    {open && <div className="auth-select-dropdown" role="listbox" aria-label={label}>
      {options.map((option) => <button className={`auth-select-option ${option.value === value ? 'is-selected' : ''}`} type="button" role="option" aria-selected={option.value === value} key={option.value} onClick={() => { onChange(option.value); setOpen(false); }}>{option.label}</button>)}
    </div>}
  </div>;
}

export function AuthPage() {
  const navigate = useNavigate();
  const { isRegister, formData, errors, isLoading, isFormValid, switchMode, handleChange, handleSubmit } = useAuthForm(() => navigate(CONFIG.ROUTES.CHAT, { replace: true }));
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [verificationAction, setVerificationAction] = useState<VerificationAction>(null);
  const years = useMemo(() => Array.from({ length: 100 }, (_, index) => new Date().getFullYear() - index), []);
  const canSubmit = isFormValid && (!isRegister || termsAccepted);

  const resetPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (emailPattern.test(resetEmail.trim())) setResetSent(true);
  };
  const changeMode = (mode: 'login' | 'register') => { setResetOpen(false); setTermsAccepted(false); switchMode(mode); };
  const requestVerification = (action: Exclude<VerificationAction, null>) => setVerificationAction(action);
  const completeVerification = (token?: string) => {
    const action = verificationAction;
    setVerificationAction(null);
    if (action === 'forgot') setResetOpen(true);
    if (action === 'submit') void handleSubmit(token);
  };

  return <main className="auth-viewport">
    <div className="auth-card-animated"><section className="auth-card" aria-label={resetOpen ? 'Восстановление пароля' : isRegister ? 'Регистрация' : 'Вход'}>
      {resetOpen ? <>
        <header className="auth-header"><h1 className="auth-title">Восстановить пароль</h1><p className="auth-subtitle">Введите email, и мы отправим инструкции по восстановлению.</p></header>
        <form className="auth-form" onSubmit={resetPassword} noValidate><fieldset className="auth-fieldset"><div className="auth-field"><label className="auth-label" htmlFor="reset-email">E-mail <span className="auth-required">*</span></label><input id="reset-email" className="auth-input" type="email" value={resetEmail} onChange={(event) => { setResetEmail(event.target.value); setResetSent(false); }} autoComplete="email" aria-invalid={Boolean(resetEmail) && !emailPattern.test(resetEmail)} />{resetSent && <span className="auth-helper-text">Если учётная запись существует, инструкции уже отправлены.</span>}</div><button className="auth-submit" type="submit" disabled={!emailPattern.test(resetEmail.trim())}>Отправить инструкции</button><button className="auth-link auth-back" type="button" onClick={() => setResetOpen(false)}>Вернуться ко входу</button></fieldset></form>
      </> : <>
        <header className="auth-header"><h1 className="auth-title">{isRegister ? 'Создать учётную запись' : 'С возвращением!'}</h1>{!isRegister && <p className="auth-subtitle">Мы так рады видеть вас снова!</p>}</header>
        <form className="auth-form" onSubmit={(event) => { event.preventDefault(); requestVerification('submit'); }} noValidate><fieldset className="auth-fieldset" disabled={isLoading}>
          {isRegister && <><Field label="E-mail" id="email" error={errors.email} required><input id="email" className="auth-input" type="email" value={formData.email} onChange={(event) => handleChange('email', event.target.value)} autoComplete="email" /></Field><Field label="Отображаемое имя" id="display-name" error={errors.displayName}><input id="display-name" className="auth-input" maxLength={32} value={formData.displayName} onChange={(event) => handleChange('displayName', event.target.value)} autoComplete="nickname" /><span className="auth-helper-text">Это имя увидят другие пользователи.</span></Field></>}
          <Field label={isRegister ? 'Имя пользователя' : 'Email или имя пользователя'} id="username" error={errors.username} required><input id="username" className="auth-input" value={formData.username} onChange={(event) => handleChange('username', event.target.value)} autoComplete="username" /></Field>
          <Field label="Пароль" id="password" error={errors.password} required><input id="password" className="auth-input" type="password" value={formData.password} onChange={(event) => handleChange('password', event.target.value)} autoComplete={isRegister ? 'new-password' : 'current-password'} />{!isRegister && <button className="auth-link auth-forgot" type="button" onClick={() => requestVerification('forgot')}>Забыли пароль?</button>}</Field>
          {isRegister && <><div className="auth-field"><span className="auth-label">Дата рождения <span className="auth-required">*</span></span><div className="auth-birthday-grid"><DateSelect label="День" value={formData.birthDay} onChange={(value) => handleChange('birthDay', value)} options={Array.from({ length: 31 }, (_, index) => ({ value: String(index + 1), label: String(index + 1) }))} /><DateSelect label="Месяц" value={formData.birthMonth} onChange={(value) => handleChange('birthMonth', value)} options={months.map((month, index) => ({ value: String(index + 1), label: month }))} /><DateSelect label="Год" value={formData.birthYear} onChange={(value) => handleChange('birthYear', value)} options={years.map((year) => ({ value: String(year), label: String(year) }))} /></div>{errors.birthDay && <span className="auth-error">{errors.birthDay}</span>}</div><Checkbox checked={termsAccepted} onChange={setTermsAccepted}>Подтверждаю согласие с <a className="auth-anchor" href="/terms">Условиями использования</a> и <a className="auth-anchor" href="/privacy">Политикой конфиденциальности</a>.</Checkbox></>}
          <button className="auth-submit" type="submit" disabled={isLoading || (isRegister && !canSubmit)}>{isLoading && <span className="auth-spinner" aria-hidden="true" />}<span>{isRegister ? 'Создать учётную запись' : 'Войти'}</span></button>
          <footer className="auth-footer">{isRegister ? <button className="auth-link" type="button" onClick={() => changeMode('login')}>Уже зарегистрированы? Войти</button> : <><span className="auth-footer-text">Нужна учётная запись?</span><button className="auth-link" type="button" onClick={() => changeMode('register')}>Зарегистрироваться</button></>}</footer>
        </fieldset></form>
      </>}
    </section></div>
    {verificationAction && <VerificationModal onClose={() => setVerificationAction(null)} onVerified={completeVerification} />}
  </main>;
}

function VerificationModal({ onClose, onVerified }: { onClose: () => void; onVerified: (token?: string) => void }) {
  return <div className="auth-verification-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="auth-verification-card" role="dialog" aria-modal="true" aria-labelledby="verification-title">
      <button className="auth-verification-close" type="button" aria-label="Закрыть" onClick={onClose}>×</button>
      <div className="auth-verification-illustration" aria-hidden="true">🕶️</div>
      <h2 id="verification-title" className="auth-verification-title">Подождите! Вы человек?</h2>
      <p className="auth-verification-subtitle">Подтвердите, что вы не робот.</p>
      <div className="auth-verification-hcaptcha">
        <HCaptcha onVerified={onVerified} />
      </div>
    </section>
  </div>;
}

function HCaptcha({ onVerified }: { onVerified: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let widgetId: number | undefined;
    const render = () => { if (containerRef.current && window.hcaptcha) widgetId = window.hcaptcha.render(containerRef.current, { sitekey: CONFIG.HCAPTCHA_SITE_KEY, callback: onVerified, hl: 'ru', theme: 'dark' }); };
    const script = document.querySelector<HTMLScriptElement>('script[src^="https://js.hcaptcha.com/1/api.js"]');
    if (window.hcaptcha) render();
    else if (script) script.addEventListener('load', render, { once: true });
    else {
      const hcaptchaScript = document.createElement('script');
      hcaptchaScript.src = 'https://js.hcaptcha.com/1/api.js?render=explicit&hl=ru';
      hcaptchaScript.async = true;
      hcaptchaScript.onload = render;
      hcaptchaScript.onerror = () => setError(true);
      document.head.append(hcaptchaScript);
    }
    return () => { if (widgetId !== undefined) window.hcaptcha?.remove(widgetId); };
  }, [onVerified]);
  return <>{error && <span className="auth-error">Не удалось загрузить hCaptcha. Проверьте подключение.</span>}<div ref={containerRef} /></>;
}

function Field({ label, id, error, required = false, children }: { label: string; id: string; error?: string; required?: boolean; children: ReactNode }) {
  return <div className="auth-field"><label className="auth-label" htmlFor={id}>{label}{required && <span className="auth-required">*</span>}</label>{children}{error && <span className="auth-error">{error}</span>}</div>;
}
