# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_wizardizer_session',
  :secret      => '18080c000805eccdd2ed20be0f28e27557e70c5f498f0faffb74a7a436442493af4eda27b7318e8cc02a5e731512e1cdfa1b7aad2be0f0722ae38b3ceba86158'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
