<?php
namespace models;

class user extends \funky\model
{
	public function hasrole($role)
	{
		return $this->roles->in($role);
	}
	public function update($data)
	{
		// if we have a new password to store, encrypt it:
		if(!empty($data['password'])) $data['password'] = $this->password->encrypt($data['password']);
		parent::update($data);
	}
	public static function fields()
	{
		return f()->load->fields([
			['email', 'text'],
			['password', 'password'],
			['roles', 'set', ['values'=>['dev', 'admin']]],
		]);
	}
}