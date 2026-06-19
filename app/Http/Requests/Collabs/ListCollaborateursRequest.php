<?php

namespace App\Http\Requests\Collabs;

use Illuminate\Foundation\Http\FormRequest;

class ListCollaborateursRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search'         => ['nullable', 'string', 'max:100'],
            'machines_min'   => ['nullable', 'integer', 'min:0'],
            'machines_max'   => ['nullable', 'integer', 'min:0'],
            'perPage'        => ['nullable', 'integer', 'min:10', 'max:200'],
            'from_date'      => ['nullable', 'date', 'before_or_equal:to_date'],
            'to_date'        => ['nullable', 'date', 'after_or_equal:from_date'],
        ];
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

    public function machinesMin(): ?int
    {
        $val = $this->validated('machines_min');
        return $val !== null ? (int) $val : null;
    }

    public function machinesMax(): ?int
    {
        $val = $this->validated('machines_max');
        return $val !== null ? (int) $val : null;
    }

    public function perPage(): int
    {
        return (int) ($this->validated('perPage') ?? 20);
    }

    public function fromDate(): ?\DateTime
    {
        $val = $this->validated('from_date');
        return $val !== null ? new \DateTime($val) : null;
    }

    public function toDate(): ?\DateTime
    {
        $val = $this->validated('to_date');
        return $val !== null ? new \DateTime($val) : null;
    }
}
