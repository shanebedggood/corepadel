-- Africa Padel --

INSERT INTO core.address (street, suburb, city, province, postal_code, country)
VALUES (
    '1 Marina Road',
    'V&A Waterfront',
    'Cape Town',
    'Western Cape',
    '8051',
    'South Africa'
);

INSERT INTO core.venue (name, website, facilities, address_id)
VALUES (
    'Africa Padel V&A Waterfront',
    'https://www.africapadel.com/clubs',
    '5 Courts, Equipment rental, Restaurant, Pro Shop, Changing rooms, Kids playground, Free parking',
    (SELECT address_id FROM core.address WHERE street = '1 Marina Road' AND city = 'Cape Town') -- This subquery helps link if you don't capture the UUID immediately
);

INSERT INTO core.address(street, suburb, city, province, postal_code, country)
VALUES (
    'Herschel Close',
    'Claremont',
    'Cape Town',
    'Western Cape',
    '7708',
    'South Africa'
);

INSERT INTO core.venue (name, website, facilities, address_id)
VALUES (
    'Africa Padel Claremont',
    'https://www.africapadel.com/clubs',
    '9 Courts, WiFi, Equipment rental, Restaurant, Pro Shop, Changing rooms, Showers, Kids playground, Free parking',
    (SELECT address_id FROM core.address WHERE street = 'Herschel Close' AND city = 'Cape Town') -- This subquery helps link if you don't capture the UUID immediately
);

INSERT INTO core.address (street, suburb, city, province, postal_code, country)
VALUES (
    '28 Du Toit Street',
    'Stellenbosch Central',
    'Cape Town',
    'Western Cape',
    '7600',
    'South Africa'
);

INSERT INTO core.venue (name, website, facilities, address_id)
VALUES (
    'Africa Padel van der Stel',
    'https://www.africapadel.com/clubs',
    '4 Courts, WiFi, Equipment rental, Restaurant, Pro Shop, Changing rooms, Showers, Free parking',
    (SELECT address_id FROM core.address WHERE street = '28 Du Toit Street' AND city = 'Cape Town') -- This subquery helps link if you don't capture the UUID immediately
);

INSERT INTO core.address (street, suburb, city, province, postal_code, country)
VALUES (
    'The Rotunda, AF Keen Drive',
    'Camps Bay',
    'Cape Town',
    'Western Cape',
    '8040',
    'South Africa'
);

INSERT INTO core.venue (name, website, facilities, address_id)
VALUES (
    'Africa Padel Camps Bay',
    'https://www.africapadel.com/clubs',
    '5 Courts, WiFi, Equipment rental, Restaurant, Pro Shop, Changing rooms, Showers, Kids playground, Free parking',
    (SELECT address_id FROM core.address WHERE street = 'The Rotunda, AF Keen Drive' AND city = 'Cape Town') -- This subquery helps link if you don't capture the UUID immediately
);

INSERT INTO core.address (street, suburb, city, province, postal_code, country)
VALUES (
    'Gravel Rd off Rietvlei Rd from N2 at Buco',
    'Plettenburg Bay"',
    'Cape Town',
    'Western Cape',
    '6000',
    'South Africa'
);

INSERT INTO core.venue (name, website, facilities, address_id)
VALUES (
    'Africa Padel Plettenburg Bay',
    'https://www.africapadel.com/clubs',
    '2 Courts, Equipment Rental, Free Parking, Private Parking, Store',
    (SELECT address_id FROM core.address WHERE street = 'Gravel Rd off Rietvlei Rd from N2 at Buco' AND city = 'Cape Town') -- This subquery helps link if you don't capture the UUID immediately
);

-- Aura Padel --

INSERT INTO core.address (street, suburb, city, province, postal_code, country)
VALUES (
    '1 Ludel Close',
    'Montague Gardens',
    'Cape Town',
    'Western Cape',
    '7441',
    'South Africa'
);

INSERT INTO core.venue (name, website, facilities, address_id)
VALUES (
    'Aura Padel Club',
    'https://www.aurapadel.co.za',
    '5 Courts, Physiotherapist, Warm-up area, Sauna, Hyperbaric Oxygen Chamber, Pro Shop, Halaal Coffee Shop, Pro Shop, Prayer Room, Co-working space, Supervised kids area',
    (SELECT address_id FROM core.address WHERE street = '1 Ludel Close' AND city = 'Cape Town') -- This subquery helps link if you don't capture the UUID immediately
);

-- Padel 365 --

INSERT INTO core.address (street, suburb, city, province, postal_code, country)
VALUES (
    'Richmond Northern CI',
    'Richmond North',
    'Cape Town',
    'Western Cape',
    '7441',
    'South Africa'
);

INSERT INTO core.venue (name, facilities, address_id) 
VALUES (
    'Padel 365 Richmond Park',
    '5 Courts, WiFi, Equipment rental, Restaurant, Pro Shop, Changing rooms, Showers, Free parking',
    (SELECT address_id FROM core.address WHERE street = 'Richmond Northern CI' AND city = 'Cape Town') -- This subquery helps link if you don't capture the UUID immediately
);

-- Atlantic Padel --

INSERT INTO core.address (street, suburb, city, province, postal_code, country)
VALUES (
    'Units 1-4 Sagittarri, Rivergate Phase 4',
    'Parklands',
    'Cape Town',
    'Western Cape',
    '7441',
    'South Africa'
);  

INSERT INTO core.venue (name, website, facilities, address_id)
VALUES (
    'Atlantic Padel Parklands',
    'https://atlanticpadel.co.za',
    '4 Courts, Disabled Access, Equipment Rental, Free Parking, Private Parking, Pro Shop, Restaurant, Cafeteria,Snack Bar, Changing Rooms, Lockers, WiFi, Play Park, Play Park',
    (SELECT address_id FROM core.address WHERE street = 'Units 1-4 Sagittarri, Rivergate Phase 4' AND city = 'Cape Town') -- This subquery helps link if you don't capture the UUID immediately
);