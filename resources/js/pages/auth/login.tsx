import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <AuthLayout
            title="Connexion à votre compte"
            description="Entrez votre email et mot de passe pour vous connecter"
        >
            <Head title="Connexion" />

            {status && (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-sm font-medium text-green-800">{status}</p>
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-5">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label 
                                    htmlFor="email" 
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Adresse e-mail
                                </Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="email@exemple.com"
                                        className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                        aria-invalid={!!errors.email}
                                        aria-describedby={errors.email ? "email-error" : undefined}
                                    />
                                </div>
                                {errors.email && (
                                    <InputError 
                                        message={errors.email} 
                                        id="email-error"
                                        className="animate-in slide-in-from-top-1 duration-200"
                                    />
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label 
                                        htmlFor="password" 
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Mot de passe
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-sm font-medium transition-colors hover:text-primary/80"
                                            tabIndex={5}
                                        >
                                            Mot de passe oublié ?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                        aria-invalid={!!errors.password}
                                        aria-describedby={errors.password ? "password-error" : undefined}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus:text-gray-600"
                                        tabIndex={-1}
                                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" aria-hidden="true" />
                                        ) : (
                                            <Eye className="h-5 w-5" aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <InputError 
                                        message={errors.password}
                                        id="password-error"
                                        className="animate-in slide-in-from-top-1 duration-200"
                                    />
                                )}
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="transition-all duration-200"
                                />
                                <Label 
                                    htmlFor="remember" 
                                    className="text-sm font-normal text-gray-700 cursor-pointer select-none"
                                >
                                    Se souvenir de moi
                                </Label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                            tabIndex={4}
                            disabled={processing}
                            data-test="login-button"
                        >
                            {processing && <Spinner className="mr-2" />}
                            {processing ? 'Connexion en cours...' : 'Se connecter'}
                        </Button>

                    </>
                )}
            </Form>
        </AuthLayout>
    );
}