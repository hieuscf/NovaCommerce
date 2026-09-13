'use client';

import * as React from 'react';
import { Mail, Search } from 'lucide-react';
import { Checkbox } from '@novacommerce/ui/components/checkbox';
import { Input } from '@novacommerce/ui/components/input';
import { Label } from '@novacommerce/ui/components/label';
import { RadioGroup, RadioGroupItem } from '@novacommerce/ui/components/radio-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@novacommerce/ui/components/select';
import { CharacterCount, Textarea } from '@novacommerce/ui/components/textarea';
import { Specimen, SpecimenGrid } from './showcase-shell';

const MAX_REVIEW_LENGTH = 160;

export function FormControlSpecimens() {
  const [review, setReview] = React.useState('');
  const [selectAll, setSelectAll] = React.useState<boolean | 'indeterminate'>('indeterminate');

  return (
    <div className="grid gap-10">
      <SpecimenGrid>
        <div className="grid gap-2">
          <Label htmlFor="ds-email">Email address</Label>
          <Input id="ds-email" type="email" placeholder="you@example.com" />
          <p className="text-caption text-muted-foreground">
            We only use this for order updates.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="ds-email-error">Email address</Label>
          <Input
            id="ds-email-error"
            type="email"
            defaultValue="not-an-email"
            aria-invalid
            aria-describedby="ds-email-error-message"
          />
          <p id="ds-email-error-message" className="text-caption font-medium text-destructive">
            Enter a valid email address.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="ds-search">With adornments</Label>
          <Input
            id="ds-search"
            placeholder="Search products…"
            startAdornment={<Search aria-hidden="true" />}
            endAdornment={<Mail aria-hidden="true" />}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="ds-disabled">Disabled</Label>
          <Input id="ds-disabled" placeholder="Unavailable" disabled />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="ds-sort">Select</Label>
          <Select defaultValue="newest">
            <SelectTrigger id="ds-sort">
              <SelectValue placeholder="Sort products" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort by</SelectLabel>
                <SelectItem value="newest">Newest arrivals</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
                <SelectItem value="unavailable" disabled>
                  Rating (unavailable)
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="ds-sort-error">Select — error</Label>
          <Select>
            <SelectTrigger id="ds-sort-error" aria-invalid>
              <SelectValue placeholder="Choose a warehouse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eu">EU · Rotterdam</SelectItem>
              <SelectItem value="us">US · Newark</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SpecimenGrid>

      <div className="grid gap-2">
        <Label htmlFor="ds-review">Textarea</Label>
        <Textarea
          id="ds-review"
          placeholder="Share your experience with this product…"
          value={review}
          maxLength={MAX_REVIEW_LENGTH}
          onChange={(event) => setReview(event.target.value)}
        />
        <CharacterCount
          value={review}
          maxLength={MAX_REVIEW_LENGTH}
          className="justify-self-end"
        />
      </div>

      <SpecimenGrid>
        <Specimen label="Checkbox" className="flex-col items-start gap-3">
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="ds-select-all"
              checked={selectAll}
              onCheckedChange={(next) => setSelectAll(next)}
            />
            <Label htmlFor="ds-select-all">Select all (indeterminate by default)</Label>
          </div>
          <div className="flex items-center gap-2.5">
            <Checkbox id="ds-free-shipping" defaultChecked />
            <Label htmlFor="ds-free-shipping">Free shipping only</Label>
          </div>
          <div className="flex items-center gap-2.5">
            <Checkbox id="ds-checkbox-disabled" disabled />
            <Label htmlFor="ds-checkbox-disabled">Disabled</Label>
          </div>
          <div className="grid gap-1.5">
            <div className="flex items-center gap-2.5">
              <Checkbox id="ds-terms" aria-invalid aria-describedby="ds-terms-error" />
              <Label htmlFor="ds-terms">Accept the terms</Label>
            </div>
            <p id="ds-terms-error" className="text-caption font-medium text-destructive">
              You must accept the terms to continue.
            </p>
          </div>
        </Specimen>

        <Specimen label="Radio group" className="flex-col items-start gap-3">
          <RadioGroup defaultValue="standard" aria-label="Shipping speed">
            <div className="flex items-start gap-2.5">
              <RadioGroupItem value="standard" id="ds-standard" />
              <div className="grid gap-0.5">
                <Label htmlFor="ds-standard">Standard</Label>
                <p className="text-caption text-muted-foreground">3–5 business days · Free</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <RadioGroupItem value="express" id="ds-express" />
              <div className="grid gap-0.5">
                <Label htmlFor="ds-express">Express</Label>
                <p className="text-caption text-muted-foreground">1–2 business days · $12</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <RadioGroupItem value="courier" id="ds-courier" disabled />
              <div className="grid gap-0.5">
                <Label htmlFor="ds-courier">Same-day courier</Label>
                <p className="text-caption text-muted-foreground">Unavailable in your area</p>
              </div>
            </div>
          </RadioGroup>
        </Specimen>
      </SpecimenGrid>
    </div>
  );
}
