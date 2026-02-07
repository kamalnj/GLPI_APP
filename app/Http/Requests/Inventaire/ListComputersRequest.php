<?php

namespace App\Http\Requests\Inventaire;

use Illuminate\Foundation\Http\FormRequest;

class ListComputersRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search'  => ['nullable', 'string', 'max:100'],
            'perPage' => ['nullable', 'integer', 'min:10', 'max:200'],
            'cpu_tier'       => ['nullable', 'string', 'max:20'],
            'missing_sophos' => ['nullable', 'boolean'],

        ];
    }
    public function perPage(): int
    {
        return (int) ($this->validated('perPage') ?? 10);
    }

    public function search(): ?string
    {
        $search = $this->validated('search');

        if (!is_string($search)) {
            return null;
        }

        $search = trim($search);

        return $search === '' ? null : $search;
    }
    public function missingSophos(): bool
    {
        return (bool) ($this->validated('missing_sophos') ?? false);
    }
    public function cpuTier(): ?string
{
    $v = $this->validated('cpu_tier');
    if (!is_string($v)) return null;

    $v = trim($v);
    return $v === '' ? null : strtolower($v);
}
}
